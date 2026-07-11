import { test } from "node:test";
import assert from "node:assert/strict";
import { assertFlociContainerMatchesConfig } from "./local.ts";

const containerFor = (
  hostPort: string,
  ecrBasePort: string,
  ecrMaxPort: string
) => ({
  HostConfig: {
    PortBindings: { "4566/tcp": [{ HostIp: "", HostPort: hostPort }] },
  },
  Config: {
    Env: [
      "FLOCI_HOSTNAME=host.docker.internal",
      `FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT=${ecrBasePort}`,
      `FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT=${ecrMaxPort}`,
    ],
  },
});

test("reuse passes when the container matches the requested ports", () => {
  assert.doesNotThrow(() =>
    assertFlociContainerMatchesConfig(
      containerFor("4566", "5200", "5299"),
      "4566",
      "5200",
      "5299"
    )
  );
});

test("reuse throws when the published FLOCI_PORT differs", () => {
  assert.throws(
    () =>
      assertFlociContainerMatchesConfig(
        containerFor("4566", "5200", "5299"),
        "4567",
        "5200",
        "5299"
      ),
    /published port 4566 \(requested 4567\)/
  );
});

test("reuse throws when the ECR registry ports differ", () => {
  assert.throws(
    () =>
      assertFlociContainerMatchesConfig(
        containerFor("4566", "5200", "5299"),
        "4566",
        "6000",
        "6099"
      ),
    /ECR base port 5200 \(requested 6000\)/
  );
});
