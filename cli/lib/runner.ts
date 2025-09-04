/* eslint-disable multiline-comment-style */
import { spawn } from "child_process";
import path from "path";

const prefixes = new Set<string>();
let maxPrefixLength = 0;

function formattedPrefix(prefix: string): string {
  if (!prefixes.has(prefix)) {
    prefixes.add(prefix);
    if (prefix.length > maxPrefixLength) {
      maxPrefixLength = prefix.length;
    }
  }
  return ` ${prefix.padStart(maxPrefixLength)}|`;
}

export async function runCommand(
  prefix: string,
  cmd: string[],
  cwd: string | null
): Promise<void> {
  const fullPath = cwd ? path.resolve(cwd) : null;
  const options = fullPath ? { cwd: fullPath } : {};

  const startingPrefix = formattedPrefix(prefix);
  process.stdout.write(
    `${startingPrefix} Running: ${cmd.join(" ")}\n` +
      (fullPath ? `\n${startingPrefix} CWD: ${fullPath}` : "") +
      "\n"
  );

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd[0], cmd.slice(1), options);

    proc.stdout.on("data", (data) => {
      const paddedPrefix = formattedPrefix(prefix);
      for (const line of data.toString().split("\n")) {
        process.stdout.write(`${paddedPrefix} ${line}\n`);
      }
    });

    proc.stderr.on("data", (data) => {
      const paddedPrefix = formattedPrefix(prefix);
      for (const line of data.toString().split("\n")) {
        process.stdout.write(`${paddedPrefix} ${line}\n`);
      }
    });

    proc.on("error", (error) => {
      const paddedPrefix = formattedPrefix(prefix);
      process.stdout.write(`${paddedPrefix} Error: ${error}\n`);
      reject(error);
    });

    proc.on("close", (code) => {
      const paddedPrefix = formattedPrefix(prefix);
      process.stdout.write(`${paddedPrefix} Exit: ${code}\n`);
      if (code !== 0) {
        reject(code);
        return;
      }
      resolve();
    });
  });
}
