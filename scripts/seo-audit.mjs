import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git","node_modules"]);
const errors = [];
const warnings = [];

function walk(dir){
  const out=[];
  for(const name of fs.readdirSync(dir)){
    if(ignored.has(name)) continue;
    const full=path.join(dir,name);
    const stat=fs.statSync(full);
    if(stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
const rel=file=>path.relative(root,file).split(path.sep).join("/");
const decode=s=>String(s||"")
  .replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#0*39;|&apos;/gi,"'")
  .replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&nbsp;/gi," ")
  .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const clean=s=>decode(String(s||"").replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();

const files=walk(root);
const htmlFiles=files.filter(f=>f.endsWith(".html"));
const published=[];

for(const file of htmlFiles){
  const fileRel=rel(file);
  if(fileRel==="404.html" || fileRel.startsWith("pl/") || fileRel.startsWith("en/")) continue;

  const html=fs.readFileSync(file,"utf8");
  const title=clean((html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]);
  const desc=decode((
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) || []
  )[1]||"").trim();
  const canonical=(
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i) || []
  )[1]||"";
  const ogTitle=decode((
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i) || []
  )[1]||"").trim();
  const ogDesc=decode((
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i) || []
  )[1]||"").trim();
  const robots=decode((
    html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i) || []
  )[1]||"").toLowerCase();
  const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>clean(m[1]));
  const lang=(html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)||[])[1]||"";

  const route=fileRel==="index.html"?"/":"/"+fileRel.replace(/index\.html$/,"");
  const expected="https://gruntiwiatr.pl"+route;

  if(!title) errors.push(fileRel+": brak title");
  if(title && (title.length<18 || title.length>75)) warnings.push(fileRel+": długość title "+title.length);
  if(!desc) errors.push(fileRel+": brak meta description");
  if(desc && (desc.length<70 || desc.length>190)) warnings.push(fileRel+": długość description "+desc.length);
  if(h1.length!==1) errors.push(fileRel+": liczba H1 = "+h1.length);
  if(lang!=="pl") warnings.push(fileRel+": html lang = "+(lang||"(brak)")+", oczekiwano pl");
  if(!canonical) errors.push(fileRel+": brak canonical");
  else if(canonical!==expected) errors.push(fileRel+": canonical "+canonical+" != "+expected);
  if(robots.includes("noindex")) errors.push(fileRel+": opublikowana strona ma noindex");
  if(!ogTitle) errors.push(fileRel+": brak og:title");
  if(!ogDesc) errors.push(fileRel+": brak og:description");
  if(ogTitle && title && ogTitle!==title) warnings.push(fileRel+": og:title różni się od title");
  if(ogDesc && desc && ogDesc!==desc) warnings.push(fileRel+": og:description różni się od meta description");

  published.push({fileRel,route,title,desc,canonical,h1:h1[0]||""});
}

function duplicateValues(items,key){
  const map=new Map();
  for(const x of items){
    const v=x[key];
    if(!v) continue;
    if(!map.has(v)) map.set(v,[]);
    map.get(v).push(x.fileRel);
  }
  return [...map.entries()].filter(([,files])=>files.length>1);
}
for(const [title,paths] of duplicateValues(published,"title")){
  warnings.push("powtórzony title: "+JSON.stringify(title)+" -> "+paths.join(", "));
}
for(const [desc,paths] of duplicateValues(published,"desc")){
  warnings.push("powtórzony meta description -> "+paths.join(", "));
}
for(const [canonical,paths] of duplicateValues(published,"canonical")){
  errors.push("powtórzony canonical "+canonical+" -> "+paths.join(", "));
}

const sitemapPath=path.join(root,"sitemap.xml");
if(!fs.existsSync(sitemapPath)) errors.push("brak sitemap.xml");
else{
  const sitemap=fs.readFileSync(sitemapPath,"utf8");
  const urls=new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].trim()));
  for(const page of published){
    if(!urls.has(page.canonical)) warnings.push(page.fileRel+": canonical nieobecny w sitemap.xml");
  }
  for(const url of urls){
    if(!url.startsWith("https://gruntiwiatr.pl/")) errors.push("sitemap: URL poza domeną "+url);
  }
}

const robotsPath=path.join(root,"robots.txt");
if(!fs.existsSync(robotsPath)) errors.push("brak robots.txt");
else{
  const robots=fs.readFileSync(robotsPath,"utf8");
  if(!/Sitemap:\s*https:\/\/gruntiwiatr\.pl\/sitemap\.xml/i.test(robots)) errors.push("robots.txt nie wskazuje głównej sitemap.xml");
  if(/Disallow:\s*\//i.test(robots)) errors.push("robots.txt blokuje cały serwis");
}

console.log("SEO AUDIT:",published.length,"opublikowanych stron PL.");
for(const warning of warnings) console.warn("WARNING:",warning);
if(errors.length){
  for(const error of errors) console.error("ERROR:",error);
  console.error("SEO AUDIT FAILED:",errors.length,"błędów.");
  process.exit(1);
}
console.log("SEO AUDIT PASSED:",warnings.length,"ostrzeżeń, brak błędów blokujących.");
