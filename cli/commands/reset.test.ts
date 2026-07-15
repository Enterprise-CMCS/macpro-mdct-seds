import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

afterEach(() => {
  mock.reset();
});

test("reset ignores stopped Floci and tears down Colima", async () => {
  const calls: { prefix: string; cmd: string[]; cwd: string | null }[] = [];
  const events: string[] = [];

  mock.module(new URL("../lib/runner.ts", import.meta.url).href, {
    namedExports: {
      runCommand: async (prefix: string, cmd: string[], cwd: string | null) => {
        calls.push({ prefix, cmd, cwd });
        if (prefix === "Stop floci") {
          throw new Error(`${prefix} failed`);
        }
      },
    },
  });

  mock.module(new URL("./update-env.ts", import.meta.url).href, {
    namedExports: {
      updateEnvFiles: () => {
        events.push("updateEnvFiles");
      },
    },
  });

  const { reset } = await import(`./reset.ts?reset-test=${Date.now()}`);

  await reset.handler();

  assert.deepEqual(events, ["updateEnvFiles"]);
  assert.deepEqual(calls, [
    {
      prefix: "Stop floci",
      cmd: ["docker", "--context", "colima", "stop", "floci-local"],
      cwd: ".",
    },
    { prefix: "Stop colima", cmd: ["colima", "stop"], cwd: "." },
    {
      prefix: "Delete colima",
      cmd: ["colima", "delete", "--force"],
      cwd: ".",
    },
  ]);
});
