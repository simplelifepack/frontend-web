import { spawnSync } from "node:child_process";

// Release uploads do not contain .git; hooks apply only to developer checkouts.
if (!process.env.CI && !process.env.VERCEL && spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" }).status === 0) {
  const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
}
