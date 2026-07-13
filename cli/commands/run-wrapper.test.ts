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
  dockerRun: string;
  dockerStart: string;
};

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  );
});

describe("./run local wrapper", () => {
  it("starts Colima and a new MiniStack container with default PROJECT and MINISTACK_PORT", async () => {
    const result = await runWrapper({
      FAKE_COLIMA_RUNNING: "false",
      FAKE_CONTAINER_EXISTS: "false",
    });

    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    assert.match(
      result.stdout,
      /colima installed but not running\. We'll start it up for you now\./
    );
    assert.match(
      result.stdout,
      /MiniStack is not running\. We'll start it up for you now\./
    );
    assert.match(result.log, /^colima start --cpu 4 --memory 10$/m);
    assert.match(result.dockerRun, /--name seds-ministack-local/);
    assert.match(result.dockerRun, /-p 4566:4566/);
    assert.match(result.log, /^cli args:local$/m);
    assert.match(result.log, /^cli PROJECT:seds$/m);
    assert.match(result.log, /^cli MINISTACK_PORT:4566$/m);
  });

  it("passes an explicit PROJECT and MINISTACK_PORT to Docker and the CLI", async () => {
    const result = await runWrapper({
      FAKE_CONTAINER_EXISTS: "false",
      MINISTACK_PORT: "4571",
      PROJECT: "demo",
    });

    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    assert.match(result.dockerRun, /--name demo-ministack-local/);
    assert.match(result.dockerRun, /-p 4571:4566/);
    assert.match(result.log, /^cli PROJECT:demo$/m);
    assert.match(result.log, /^cli MINISTACK_PORT:4571$/m);
  });

  it("uses an existing container published port when MINISTACK_PORT is unset", async () => {
    const result = await runWrapper({
      FAKE_CONTAINER_EXISTS: "true",
      FAKE_CONTAINER_RUNNING: "true",
      FAKE_PUBLISHED_PORT: "4570",
      PROJECT: "demo",
    });

    assert.equal(result.code, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
    assert.equal(result.dockerRun, "");
    assert.equal(result.dockerStart, "");
    assert.match(
      result.log,
      /^docker inspect -f \{\{with \(index \.NetworkSettings\.Ports "4566\/tcp"\)\}\}\{\{\(index \. 0\)\.HostPort\}\}\{\{end\}\} demo-ministack-local$/m
    );
    assert.match(result.log, /^cli PROJECT:demo$/m);
    assert.match(result.log, /^cli MINISTACK_PORT:4570$/m);
  });

  it("starts an existing stopped MiniStack container", async () => {
    const result = await runWrapper({
      FAKE_CONTAINER_EXISTS: "true",
      FAKE_CONTAINER_RUNNING: "false",
      FAKE_PUBLISHED_PORT: "4572",
    });

    assert.equal(result.code, 0);
    assert.equal(
      result.stdout,
      "MiniStack is installed but not running. We'll start it up for you now.\n"
    );
    assert.equal(result.stderr, "");
    assert.equal(result.dockerRun, "");
    assert.equal(result.dockerStart, "seds-ministack-local\n");
    assert.match(result.log, /^cli MINISTACK_PORT:4572$/m);
  });

  it("exits before installing dependencies when an existing container does not publish port 4566", async () => {
    const result = await runWrapper({
      FAKE_CONTAINER_EXISTS: "true",
      FAKE_PUBLISHED_PORT: "",
    });

    assert.equal(result.code, 1);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /MiniStack container exists but does not publish port 4566\/tcp\. Set MINISTACK_PORT and retry\./
    );
    assert.doesNotMatch(result.log, /^yarn install/m);
    assert.doesNotMatch(result.log, /^cli args:/m);
  });
});

const runWrapper = async (envOverrides: WrapperEnv): Promise<WrapperResult> => {
  const fixture = await setupFixture();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: `${fixture.bin}${path.delimiter}${process.env.PATH ?? ""}`,
    RUN_WRAPPER_DOCKER_RUN_LOG: fixture.dockerRun,
    RUN_WRAPPER_DOCKER_START_LOG: fixture.dockerStart,
    RUN_WRAPPER_LOG: fixture.log,
  };

  for (const key of [
    "CI",
    "MINISTACK_CONTAINER_NAME",
    "MINISTACK_PORT",
    "PROJECT",
  ]) {
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
    dockerRun: await readIfExists(fixture.dockerRun),
    dockerStart: await readIfExists(fixture.dockerStart),
  };
};

const setupFixture = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "seds-run-wrapper-"));
  tempDirs.push(dir);

  const bin = path.join(dir, "bin");
  const cli = path.join(dir, "cli");
  const log = path.join(dir, "wrapper.log");
  const dockerRun = path.join(dir, "docker-run.log");
  const dockerStart = path.join(dir, "docker-start.log");
  await mkdir(bin, { recursive: true });
  await mkdir(cli, { recursive: true });
  await symlink(runScript, path.join(dir, "run"));
  await writeFile(path.join(dir, ".nvmrc"), await readFile(nvmrc, "utf8"));

  await writeExecutable(
    path.join(cli, "run.ts"),
    [
      "#!/bin/sh",
      "{",
      '  echo "cli args:$*"',
      '  echo "cli PROJECT:${PROJECT:-}"',
      '  echo "cli MINISTACK_PORT:${MINISTACK_PORT:-}"',
      '} >> "$RUN_WRAPPER_LOG"',
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
    path.join(bin, "docker"),
    [
      "#!/bin/sh",
      'if [ "$1" = "--context" ]; then',
      "  shift 2",
      "fi",
      'command="$1"',
      "shift || true",
      'echo "docker ${command} $*" >> "$RUN_WRAPPER_LOG"',
      'case "$command" in',
      "  info)",
      '    [ "${FAKE_DOCKER_INFO:-ok}" = "ok" ]',
      "    exit",
      "    ;;",
      "  inspect)",
      '    if [ "$1" = "-f" ]; then',
      '      format="$2"',
      '      if [ "${FAKE_CONTAINER_EXISTS:-false}" != "true" ]; then exit 1; fi',
      '      case "$format" in',
      '        *NetworkSettings.Ports*) printf "%s\\n" "${FAKE_PUBLISHED_PORT:-}"; exit 0 ;;',
      '        *State.Running*) printf "%s\\n" "${FAKE_CONTAINER_RUNNING:-true}"; exit 0 ;;',
      "      esac",
      "      exit 1",
      "    fi",
      '    if [ "${FAKE_CONTAINER_EXISTS:-false}" = "true" ]; then',
      "      printf '%s\\n' '[{\"State\":{\"Running\":true}}]'",
      "      exit 0",
      "    fi",
      "    exit 1",
      "    ;;",
      "  run)",
      '    printf "%s\\n" "$*" > "$RUN_WRAPPER_DOCKER_RUN_LOG"',
      "    exit 0",
      "    ;;",
      "  start)",
      '    printf "%s\\n" "$*" > "$RUN_WRAPPER_DOCKER_START_LOG"',
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

  return { bin, dir, dockerRun, dockerStart, log };
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
