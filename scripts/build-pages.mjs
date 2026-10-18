import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(project, "docs");

// docs/ is the generated, committed output used by GitHub Pages' branch mode.
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(resolve(project, "dist"), target, { recursive: true });
await cp(resolve(project, "preview.html"), resolve(target, "preview.html"));
await writeFile(resolve(target, ".nojekyll"), "");
console.log("GitHub Pages output: docs/ (branch main, folder /docs)");
