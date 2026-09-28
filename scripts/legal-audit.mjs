import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignored = new Set([".git","node_modules"]);
const approvedDomains = [
  "eli.gov.pl",
  "gov.pl",
  "podatki.gov.pl",
  "orzeczenia.nsa.gov.pl",
  "nsa.gov.pl",
  "ekw.ms.gov.pl",
  "isap.sejm.gov.pl"
];
const errors=[];
const warnings=[];
const reviewed=[];

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
function rel(file){return path.relative(root,file).split(path.sep).join("/");}
function officialLinks(html){
  return [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
    .map(m=>m[1])
    .filter(url=>{
      try{
        const host=new URL(url).hostname.toLowerCase();
        return approvedDomains.some(d=>host===d||host.endsWith("."+d));
      }catch{return false;}
    });
}
function centralRegisterLink(html){
  return /href=["'][^"']*stan-prawny\/?["']/i.test(html);
}

for(const file of walk(root).filter(f=>f.endsWith(".html"))){
  const html=fs.readFileSync(file,"utf8");
  if(!/<span class=["']label["']>PRAWO<\/span>/i.test(html)) continue;
  const links=officialLinks(html);
  const central=centralRegisterLink(html);
  reviewed.push({path:rel(file),officialLinks:links.length,central});
  if(!links.length && !central){
    errors.push(`${rel(file)}: zawiera etykietę PRAWO bez linku do źródła urzędowego ani rejestru stanu prawnego`);
  } else if(!links.length && central){
    warnings.push(`${rel(file)}: PRAWO opiera się tylko na centralnym rejestrze; przy kolejnym audycie rozważyć link claim-level`);
  }
}

const sourcePath=path.join(root,"legal-sources.json");
if(!fs.existsSync(sourcePath)){
  errors.push("brak legal-sources.json");
}else{
  let registry;
  try{registry=JSON.parse(fs.readFileSync(sourcePath,"utf8"));}
  catch{errors.push("legal-sources.json: nieprawidłowy JSON"); registry=null;}
  if(registry){
    if(!registry.verified) errors.push("legal-sources.json: brak daty verified");
    for(const source of registry.sources||[]){
      if(!source.id||!source.title||!source.url) errors.push("legal-sources.json: niepełny wpis źródła");
      try{
        const host=new URL(source.url).hostname.toLowerCase();
        if(!approvedDomains.some(d=>host===d||host.endsWith("."+d))){
          warnings.push(`legal-sources.json: źródło spoza listy urzędowej: ${source.id} -> ${host}`);
        }
      }catch{
        errors.push(`legal-sources.json: błędny URL w ${source.id}`);
      }
    }
  }
}

console.log(`LEGAL QA: ${reviewed.length} stron zawiera etykietę PRAWO.`);
for(const item of reviewed) console.log(`  ${item.path}: official=${item.officialLinks}, central=${item.central}`);
for(const warning of warnings) console.warn("WARNING:",warning);
if(errors.length){
  for(const error of errors) console.error("ERROR:",error);
  console.error(`LEGAL QA FAILED: ${errors.length} błędów.`);
  process.exit(1);
}
console.log("LEGAL QA PASSED.");
