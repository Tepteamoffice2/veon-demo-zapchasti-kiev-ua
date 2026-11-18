// Project lint without heavy dependencies: rules of the studio demo (demo.md §6, Hallmark Floor 1).
// - colours and font-family only in src/styles/tokens.css
// - no links or images pointing to the client's current site (zapchasti.kiev.ua and subdomains)
// - no "demo" labels, no placeholders
// - only one page besides 404
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const src = path.join(root, "src");
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/.(astro|ts|tsx|js|mjs|css|md|json|svg|html)$/i.test(f.name)) files.push(p); } };
walk(src);

const errors = [];
const rel = (p) => path.relative(root, p);
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  const isTokens = f.endsWith(path.join("styles", "tokens.css"));
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const at = `${rel(f)}:${i + 1}`;
    if (/\.(css|astro)$/.test(f) && !isTokens) {
      const code = line.replace(/\/\*.*?\*\//g, "");
      if (/(^|[^&\w-])#[0-9a-fA-F]{3,8}\b(?![\w-])/.test(code) && !/content="#|href="#|`#|"#\w|'#/.test(code)) errors.push(`${at} literal colour outside tokens.css`);
      if (/\b(rgb|rgba|hsl|hsla|oklch)\(/.test(code)) errors.push(`${at} literal colour function outside tokens.css`);
      if (/font-family\s*:(?!\s*var\(--font-)/.test(code)) errors.push(`${at} literal font-family outside tokens.css`);
    }
    if (/(href|src)\s*=\s*["'{`][^"'`]*zapchasti\.kiev\.ua/i.test(line) && !/mailto:|email@/.test(line)) errors.push(`${at} link to the client's current site`);
    if (/https?:\/\/([\w-]+\.)?zapchasti\.kiev\.ua/i.test(line)) errors.push(`${at} URL of the client's current site`);
    if (/\{\{|lorem ipsum|\bTODO\b/i.test(line)) errors.push(`${at} placeholder`);
    if (/>[^<]*\b(демо|demo)\b[^<]*</i.test(line)) errors.push(`${at} "demo" label in the interface`);
    if (/transition\s*:\s*all\b/.test(line)) errors.push(`${at} transition: all`);
  });
}
const pages = fs.readdirSync(path.join(src, "pages")).filter((p) => !/^(index|404)\.astro$/.test(p));
if (pages.length) errors.push(`only index and 404 pages are allowed, found: ${pages.join(", ")}`);

if (errors.length) { console.error(errors.join("\n")); console.error(`lint: ${errors.length} problem(s)`); process.exit(1); }
console.log(`lint: ${files.length} files OK`);
