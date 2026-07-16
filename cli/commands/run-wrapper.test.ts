import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const runScript = fileURLToPath(new URL("../../run", import.meta.url));
const nvmrc = fileURLToPath(new URL("../../.nvmrc", import.meta.url));
const tempDirs: string[] = [];

type WrapperEnv = Record<string, string | undefined>;

type WrapperResult = {
  code: number;
  stdout: string;
  stderr: string;
  log: string;
};

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  );
});

describe("./run local wrapper", () => {
  it("starts Colima when Floci local mode needs the container runtime", async () => {
    const result = await runWrapper({ FAKE_COLIMA_RUNNING: "false" });

    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    assert.match(
      result.stdout,
      /colima installed but not running\. We'll start it up for you now\./
    );
    assert.match(result.log, /^colima status$/m);
    assert.match(result.log, /^colima start --cpu 4 --memory 10$/m);
    assert.match(result.log, /^cli args:local$/m);
  });

  it("checks Floci wrapper prerequisites before starting the CLI", async () => {
    const result = await runWrapper({});

    assert.equal(result.code, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
    assert.match(result.log, /^colima status$/m);
    assert.match(result.log, /^yarn install$/m);
    assert.match(result.log, /^cli args:local$/m);
  });
});

const runWrapper = async (envOverrides: WrapperEnv): Promise<WrapperResult> => {
  const fixture = await setupFixture();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: `${fixture.bin}${path.delimiter}${process.env.PATH ?? ""}`,
    RUN_WRAPPER_LOG: fixture.log,
  };

  for (const key of ["CI"]) {
    delete env[key];
  }

  for (const [key, value] of Object.entries(envOverrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }

  let code = 0;
  let stdout = "";
  let stderr = "";

  try {
    const result = await execFileAsync("./run", ["local"], {
      cwd: fixture.dir,
      encoding: "utf8",
      env,
    });
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (error) {
    const result = error as {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    code = result.code ?? 1;
    stdout = result.stdout ?? "";
    stderr = result.stderr ?? "";
  }

  return {
    code,
    stdout,
    stderr,
    log: await readIfExists(fixture.log),
  };
};

const setupFixture = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "seds-run-wrapper-"));
  tempDirs.push(dir);

  const bin = path.join(dir, "bin");
  const cli = path.join(dir, "cli");
  const log = path.join(dir, "wrapper.log");
  await mkdir(bin, { recursive: true });
  await mkdir(cli, { recursive: true });
  await symlink(runScript, path.join(dir, "run"));
  await writeFile(path.join(dir, ".nvmrc"), await readFile(nvmrc, "utf8"));

  await writeExecutable(
    path.join(cli, "run.ts"),
    [
      "#!/bin/sh",
      'echo "cli args:$*" >> "$RUN_WRAPPER_LOG"',
      'exit "${FAKE_CLI_EXIT:-0}"',
      "",
    ].join("\n")
  );

  await writeExecutable(
    path.join(bin, "node"),
    [
      "#!/bin/sh",
      'if [ "$1" = "-v" ]; then',
      '  cat "$PWD/.nvmrc"',
      "  exit 0",
      "fi",
      'echo "unexpected node $*" >> "$RUN_WRAPPER_LOG"',
      "exit 1",
      "",
    ].join("\n")
  );

  await writeExecutable(
    path.join(bin, "corepack"),
    [
      "#!/bin/sh",
      'echo "corepack $*" >> "$RUN_WRAPPER_LOG"',
      "exit 0",
      "",
    ].join("\n")
  );

  await writeExecutable(
    path.join(bin, "colima"),
    [
      "#!/bin/sh",
      'echo "colima $*" >> "$RUN_WRAPPER_LOG"',
      'case "$1" in',
      "  status)",
      '    if [ "${FAKE_COLIMA_RUNNING:-true}" = "true" ]; then',
      '      echo "colima is running"',
      "      exit 0",
      "    fi",
      '    echo "colima is stopped"',
      "    exit 1",
      "    ;;",
      "  start)",
      "    exit 0",
      "    ;;",
      "esac",
      "exit 1",
      "",
    ].join("\n")
  );

  await writeExecutable(
    path.join(bin, "yarn"),
    ["#!/bin/sh", 'echo "yarn $*" >> "$RUN_WRAPPER_LOG"', "exit 0", ""].join(
      "\n"
    )
  );

  return { bin, dir, log };
};

const writeExecutable = async (filePath: string, contents: string) => {
  await writeFile(filePath, contents);
  await chmod(filePath, 0o755);
};

const readIfExists = async (filePath: string) => {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
};
