import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git", "node_modules"]);
const errors = [];
const warnings = [];

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const files = walk(root);
const existing = new Set(files.map(rel));
const htmlFiles = files.filter(f => f.endsWith(".html"));

function attr(html, tag, attrName) {
  const rx = new RegExp("<" + tag + "\\b[^>]*\\b" + attrName + "=[\"']([^\"']*)[\"'][^>]*>", "gi");
  return [...html.matchAll(rx)].map(m => m[1]);
}

function resolveInternal(from, href) {
  if (!href || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  const [raw, hash = ""] = href.split("#");
  if (!raw) return { file: from, hash };

  const base = from.split("/");
  base.pop();
  const parts = raw.startsWith("/") ? [] : base;
  for (const seg of raw.replace(/^\/+/, "").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  let target = parts.join("/");
  if (!target) target = "index.html";
  else if (raw.endsWith("/")) target += "/index.html";
  else if (!/\.[a-z0-9]+$/i.test(target)) target += "/index.html";
  return { file: target, hash };
}

for (const file of htmlFiles) {
  const fileRel = rel(file);
  const html = fs.readFileSync(file, "utf8");
  const isRootRedirect = false;
  const isEnglishDraft = fileRel.startsWith("en/");
  const isLegacyPolish = fileRel.startsWith("pl/");
  const isErrorPage = fileRel === "404.html";
  const isPublishedPolish = !isEnglishDraft && !isLegacyPolish && !isErrorPage && fileRel.endsWith(".html");

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || "";
  const desc = (
    html.match(/<meta[^>]+name=[\"']description[\"'][^>]+content=[\"']([^\"']*)[\"']/i) ||
    html.match(/<meta[^>]+content=[\"']([^\"']*)[\"'][^>]+name=[\"']description[\"']/i) ||
    []
  )[1] || "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const ids = [...html.matchAll(/\sid=[\"']([^\"']+)[\"']/gi)].map(m => m[1]);
  const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];

  const hasViewport = /<meta[^>]+name=[\"']viewport[\"']/i.test(html);
  const hasNoindex = /<meta[^>]+name=[\"']robots[\"'][^>]+content=[\"'][^\"']*noindex/i.test(html);
  const hasStyles = /<link[^>]+rel=[\"']stylesheet[\"']/i.test(html);
  const hasSiteScript = /<script[^>]+src=[\"'][^\"']*assets\/site\.js[\"']/i.test(html);
  const canonical = (html.match(/<link[^>]+rel=[\"']canonical[\"'][^>]+href=[\"']([^\"']+)[\"']/i) || html.match(/<link[^>]+href=[\"']([^\"']+)[\"'][^>]+rel=[\"']canonical[\"']/i) || [])[1] || "";
  const hasFavicon = /<link[^>]+rel=[\"']icon[\"'][^>]+href=[\"']\/favicon\.svg[\"']/i.test(html);
  const hasOgTitle = /<meta[^>]+property=[\"']og:title[\"']/i.test(html);
  const hasOgDescription = /<meta[^>]+property=[\"']og:description[\"']/i.test(html);
  const hasOgUrl = /<meta[^>]+property=[\"']og:url[\"']/i.test(html);
  const ogImage = (html.match(/<meta[^>]+property=[\"']og:image[\"'][^>]+content=[\"']([^\"']+)[\"']/i) || html.match(/<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+property=[\"']og:image[\"']/i) || [])[1] || "";

  if (!title) errors.push(`${fileRel}: brak <title>`);
  if (!hasViewport) errors.push(`${fileRel}: brak meta viewport`);
  if ((isEnglishDraft || isLegacyPolish) && !hasNoindex) errors.push(`${fileRel}: brak noindex na stronie roboczej EN lub legacy /pl`);
  if (isPublishedPolish && hasNoindex) errors.push(`${fileRel}: noindex blokuje opublikowaną polską stronę`);
  if (isPublishedPolish && !canonical) errors.push(`${fileRel}: brak canonical na opublikowanej polskiej stronie`);
  if (isPublishedPolish && canonical && !canonical.startsWith("https://gruntiwiatr.pl/")) errors.push(`${fileRel}: canonical poza domeną gruntiwiatr.pl`);
  if (isPublishedPolish && !hasFavicon) errors.push(`${fileRel}: brak favicon`);
  if (isPublishedPolish && (!hasOgTitle || !hasOgDescription || !hasOgUrl)) errors.push(`${fileRel}: niepełne Open Graph`);
  if (isPublishedPolish && ogImage !== "https://gruntiwiatr.pl/assets/og-grunt-i-wiatr.jpg") errors.push(`${fileRel}: og:image wskazuje niewlasciwy obraz`);
  if (isLegacyPolish) {
    const legacyCanonical = fileRel === "pl/index.html"
      ? "https://gruntiwiatr.pl/"
      : "https://gruntiwiatr.pl/" + fileRel.slice(3).replace(/index\.html$/, "");
    if (canonical !== legacyCanonical) errors.push(`${fileRel}: nieprawidlowy canonical przekierowania legacy`);
  }
  if (!isLegacyPolish && !desc) errors.push(`${fileRel}: brak meta description`);
  if (!isLegacyPolish && !hasStyles) errors.push(`${fileRel}: brak arkusza stylów`);
  if (!isLegacyPolish && !hasSiteScript) warnings.push(`${fileRel}: brak assets/site.js`);
  if (!isLegacyPolish && h1Count !== 1) errors.push(`${fileRel}: liczba H1 = ${h1Count}, oczekiwano 1`);
  if (duplicateIds.length) errors.push(`${fileRel}: powtórzone id: ${duplicateIds.join(", ")}`);

  const idsSet = new Set(ids);
  const refs = [
    ...attr(html, "a", "href"),
    ...attr(html, "script", "src"),
    ...attr(html, "img", "src"),
    ...attr(html, "link", "href")
  ];

  for (const href of refs) {
    const target = resolveInternal(fileRel, href);
    if (!target) continue;
    if (!existing.has(target.file)) {
      errors.push(`${fileRel}: brak celu ${href} -> ${target.file}`);
      continue;
    }
    if (target.file === fileRel && target.hash && !idsSet.has(target.hash)) {
      errors.push(`${fileRel}: brak kotwicy #${target.hash}`);
    }
  }
}

const indexFile = path.join(root, "content-index.json");
if (!fs.existsSync(indexFile)) errors.push("brak content-index.json");
else {
  const index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
  const entries = [...(index.tools || []), ...(index.materials || [])];
  const ids = entries.map(x => x.id);
  const paths = entries.map(x => x.path);
  const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  const duplicatePaths = [...new Set(paths.filter((p, i) => paths.indexOf(p) !== i))];
  if (duplicateIds.length) errors.push("content-index: powtórzone id: " + duplicateIds.join(", "));
  if (duplicatePaths.length) errors.push("content-index: powtórzone ścieżki: " + duplicatePaths.join(", "));

  for (const item of entries) {
    const target = item.path.replace(/^\//, "") + (item.path.endsWith("/") ? "index.html" : "");
    if (!existing.has(target)) errors.push(`content-index: ${item.id} wskazuje brakujący plik ${target}`);
    if (!item.title) errors.push(`content-index: ${item.id} bez title`);
    if (!item.category) warnings.push(`content-index: ${item.id} bez category`);
  }

  if ((index.materials || []).length !== 55) warnings.push(`content-index: liczba GUIDE = ${(index.materials || []).length}, oczekiwano 55`);

  if (Array.isArray(index.searchIndexParts)) {
    const searchEntries = [];
    for (const part of index.searchIndexParts) {
      if (!existing.has(part)) errors.push(`content-index: brak paczki wyszukiwarki ${part}`);
      else {
        try {
          const payload = JSON.parse(fs.readFileSync(path.join(root, part), "utf8"));
          if (!Array.isArray(payload)) errors.push(`${part}: indeks nie jest tablicą`);
          else searchEntries.push(...payload);
        } catch (e) {
          errors.push(`${part}: nieprawidłowy JSON`);
        }
      }
    }
    const expectedIds = new Set(entries.map(x => x.id));
    const searchIds = searchEntries.map(x => x.id);
    const searchIdSet = new Set(searchIds);
    const duplicatedSearchIds = [...new Set(searchIds.filter((id, i) => searchIds.indexOf(id) !== i))];
    const missingFromSearch = [...expectedIds].filter(id => !searchIdSet.has(id));
    const orphanedInSearch = [...searchIdSet].filter(id => !expectedIds.has(id));
    if (duplicatedSearchIds.length) errors.push(`search-index: powtórzone id: ${duplicatedSearchIds.join(", ")}`);
    if (missingFromSearch.length) errors.push(`search-index: brak materiałów: ${missingFromSearch.join(", ")}`);
    if (orphanedInSearch.length) errors.push(`search-index: materiały spoza content-index: ${orphanedInSearch.join(", ")}`);
  }
}

console.log(`QA: ${htmlFiles.length} stron HTML, ${existing.size} plików.`);
for (const warning of warnings) console.warn("WARNING:", warning);
if (errors.length) {
  for (const error of errors) console.error("ERROR:", error);
  console.error(`QA FAILED: ${errors.length} błędów.`);
  process.exit(1);
}
console.log("QA PASSED: brak błędów strukturalnych.");

if (!existing.has("assets/og-grunt-i-wiatr.jpg")) errors.push("brak assets/og-grunt-i-wiatr.jpg");
