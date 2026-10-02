import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const indexPath = path.join(root, "content-index.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const entries = [...(index.tools || []), ...(index.materials || [])];
const chunkSize = 8;

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function textOnly(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function extract(html) {
  const article =
    (html.match(/<article\b[^>]*class=["'][^"']*\barticle\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/i) || [])[1] ||
    (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [])[1] ||
    html;

  const clean = article
    .replace(/<(script|style|nav)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+class=["'][^"']*\bmobile-dock\b[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, " ");

  const headings = [...clean.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map(m => textOnly(m[1]))
    .filter(Boolean);

  return { headings, text: textOnly(clean) };
}

function htmlPathFor(item) {
  const p = item.path.replace(/^\//, "");
  return path.join(root, p, "index.html");
}

const shards = [];
for (let start = 0; start < entries.length; start += chunkSize) {
  const payload = entries.slice(start, start + chunkSize).map(item => {
    const file = htmlPathFor(item);
    if (!fs.existsSync(file)) throw new Error(`${item.id}: brak ${path.relative(root, file)}`);
    return { ...item, ...extract(fs.readFileSync(file, "utf8")) };
  });
  const no = String(shards.length + 1).padStart(2, "0");
  shards.push({ file: `search-index/part-${no}.json`, content: JSON.stringify(payload) });
}

const errors = [];
for (const shard of shards) {
  const target = path.join(root, shard.file);
  if (checkOnly) {
    if (!fs.existsSync(target)) errors.push(`brak ${shard.file}`);
    else if (fs.readFileSync(target, "utf8") !== shard.content) errors.push(`${shard.file} jest nieaktualny`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, shard.content);
    console.log("written", shard.file);
  }
}

if (checkOnly) {
  const expected = new Set(shards.map(x => x.file));
  const dir = path.join(root, "search-index");
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter(x => /^part-\d+\.json$/.test(x))) {
      const rel = `search-index/${name}`;
      if (!expected.has(rel)) errors.push(`osierocona paczka ${rel}`);
    }
  }
  if (errors.length) {
    errors.forEach(e => console.error("ERROR:", e));
    process.exit(1);
  }
  console.log(`SEARCH INDEX PASSED: ${entries.length} materiałów w ${shards.length} paczkach.`);
}
