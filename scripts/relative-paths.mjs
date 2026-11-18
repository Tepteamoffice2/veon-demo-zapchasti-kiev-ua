// After `astro build`: make asset URLs relative so dist/ works from any folder, any static host and file:// (review screenshots).
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? walk(path.join(d, f.name)) : [path.join(d, f.name)]));
let changed = 0;
for (const file of walk(dist)) {
  const ext = path.extname(file);
  if ((ext !== ".html" && ext !== ".css") || path.basename(file) === "404.html") continue; // 404 is served at any depth: keep root URLs
  const depth = path.relative(dist, path.dirname(file)).split(path.sep).filter(Boolean).length;
  const prefix = depth ? "../".repeat(depth) : "./";
  const src = fs.readFileSync(file, "utf8");
  let out = src;
  if (ext === ".html") {
    out = out.replace(/(\s(?:href|src)=["'])\/(?!\/)/g, `$1${prefix}`).replace(new RegExp(`(\\s(?:href|src)=["'])${prefix.replace(/\./g, "\\.").replace(/\//g, "\\/")}(["'])`, "g"), `$1${prefix}index.html$2`);
  } else {
    out = out.replace(/url\(\s*(["']?)\/(?!\/)/g, `url($1${prefix}`);
  }
  if (out !== src) { fs.writeFileSync(file, out); changed += 1; }
}
console.log(`relative-paths: ${changed} file(s) updated`);
