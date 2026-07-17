import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type AssetManifest = {
  files?: Record<string, FileAsset>;
};

type FileAsset = {
  source?: {
    path?: string;
    packaging?: string;
  };
  destinations?: Record<string, FileAssetDestination>;
};

type FileAssetDestination = {
  bucketName?: string;
  objectKey?: string;
};

const assetManifestPaths = process.argv.slice(2);
const flociPort = process.env.FLOCI_PORT ?? "4566";
let syncedDestinations = 0;

if (assetManifestPaths.length === 0) {
  throw new Error("Expected at least one CDK asset manifest path.");
}

for (const manifestPath of assetManifestPaths) {
  const resolvedManifestPath = path.resolve(manifestPath);
  const cdkOutDir = path.dirname(resolvedManifestPath);
  const cacheDir = path.join(cdkOutDir, ".cache");
  const manifest = JSON.parse(
    fs.readFileSync(resolvedManifestPath, "utf8")
  ) as AssetManifest;

  fs.mkdirSync(cacheDir, { recursive: true });

  for (const [assetId, asset] of Object.entries(manifest.files ?? {})) {
    if (!asset.source?.path || !asset.destinations) {
      throw new Error(`Invalid CDK file asset ${assetId} in ${manifestPath}`);
    }

    const sourcePath = path.join(cdkOutDir, asset.source.path);
    const bodyPath =
      asset.source.packaging === "zip"
        ? zipAsset(cacheDir, assetId, sourcePath)
        : sourcePath;

    for (const destination of Object.values(asset.destinations)) {
      if (!destination.bucketName || !destination.objectKey) {
        throw new Error(`Invalid CDK file asset destination for ${assetId}`);
      }

      execFileSync(
        "curl",
        [
          "-fsS",
          "--retry",
          "5",
          "--retry-delay",
          "1",
          "--retry-all-errors",
          "--retry-connrefused",
          "-X",
          "PUT",
          "-H",
          `Content-Type: ${
            asset.source.packaging === "zip"
              ? "application/zip"
              : "application/octet-stream"
          }`,
          "--data-binary",
          `@${bodyPath}`,
          `http://localhost:${flociPort}/${destination.bucketName}/${destination.objectKey}`,
        ],
        { stdio: ["ignore", "ignore", "inherit"] }
      );
      syncedDestinations++;
    }
  }
}

console.log(`Synced ${syncedDestinations} CDK file asset destination(s).`);

function zipAsset(cacheDir: string, assetId: string, sourcePath: string) {
  const zipPath = path.join(cacheDir, `${assetId}.zip`);

  fs.rmSync(zipPath, { force: true });
  execFileSync("zip", ["-rqX", zipPath, "."], {
    cwd: sourcePath,
    stdio: ["ignore", "ignore", "inherit"],
  });

  return zipPath;
}
