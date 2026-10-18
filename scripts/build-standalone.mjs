import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, extname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { transformWithEsbuild } from "vite";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const build = resolve(project, "dist");
const output = resolve(project, "standalone");
const mimeTypes = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function assetPath(reference) {
  const file = resolve(build, reference.replace(/^\//, ""));
  const subpath = relative(build, file);
  if (subpath.startsWith("..") || isAbsolute(subpath)) {
    throw new Error(`Asset escapes build directory: ${reference}`);
  }
  return file;
}

async function dataUrl(reference, relativeTo = build) {
  const file = reference.startsWith("/")
    ? assetPath(reference)
    : resolve(relativeTo, reference);
  const subpath = relative(build, file);
  if (subpath.startsWith("..") || isAbsolute(subpath)) {
    throw new Error(`Asset escapes build directory: ${reference}`);
  }
  const mime = mimeTypes[extname(file)];
  if (!mime) throw new Error(`Unsupported asset: ${reference}`);
  return `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
}

let html = await readFile(resolve(build, "index.html"), "utf8");
const styleLinks = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
if (!styleLinks.length) throw new Error("No built stylesheets found");
for (const [link] of styleLinks) {
  const reference = link.match(/href="([^"]+)"/)?.[1];
  if (!reference) throw new Error("Stylesheet has no path");
  const cssFile = assetPath(reference);
  let css = await readFile(cssFile, "utf8");
  const urls = [...css.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^\s)]+))\)/g)];
  for (const match of urls) {
    const url = match[1] || match[2] || match[3];
    if (url.startsWith("data:")) continue;
    if (/^[a-z]+:/i.test(url)) throw new Error(`Remote CSS asset: ${url}`);
    css = css.replace(
      match[0],
      `url("${await dataUrl(url, dirname(cssFile))}")`,
    );
  }
  html = html.replace(
    link,
    () => `<style>${css.replaceAll("</style", "<\\/style")}</style>`,
  );
}

const scripts = [
  ...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g),
];
if (scripts.length !== 1) throw new Error("Expected one bundled app entry");
for (const [tag, reference] of scripts) {
  const javascript = await readFile(assetPath(reference), "utf8");
  // Use a classic self-contained script so file previews do not need module
  // resolution, an HTTP server, or access to sibling assets.
  const { code } = await transformWithEsbuild(
    javascript,
    "detective-bundle.js",
    {
      format: "iife",
      target: "es2020",
      minify: true,
    },
  );
  // Vite places deferred modules in <head>. A classic inline bundle must run
  // after the app container exists, so move it to the end of the body.
  html = html.replace(tag, "");
  html = html.replace(
    "</body>",
    () => `<script>${code.replaceAll("</script", "<\\/script")}</script>\n</body>`,
  );
}

const favicon = html.match(/<link\b[^>]*rel="icon"[^>]*>/)?.[0];
if (favicon) {
  const reference = favicon.match(/href="([^"]+)"/)?.[1];
  html = html.replace(
    favicon,
    favicon.replace(reference, await dataUrl(reference)),
  );
}

const license = (
  await readFile(resolve(build, "FONT-LICENSE.txt"), "utf8")
).replaceAll("--", "—");
html = html.replace(
  "</head>",
  `<!-- Bundled font license\n${license}\n-->\n</head>`,
);
await mkdir(output, { recursive: true });
const target = resolve(output, "꼬마탐정단.html");
// The development source index and this ready-to-open preview are deliberately
// distinct: opening the source index as a plain file cannot resolve Vite imports.
html = html.replace(/<a\b[^>]*id="startup-standalone"[^>]*>[\s\S]*?<\/a\s*>/, "");
await writeFile(target, html);
await writeFile(resolve(project, "preview.html"), html);
console.log(
  `Standalone app: ${target} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`,
);
