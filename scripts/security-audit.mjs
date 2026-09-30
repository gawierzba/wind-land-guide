import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules']);
const textExts = new Set(['.html', '.js', '.mjs', '.json', '.css', '.md', '.txt', '.xml', '.yml', '.yaml']);
const forbiddenFiles = [
  /^\.env(?:\.|$)/i,
  /\.(?:pem|key|p12|pfx)$/i,
];

const secretPatterns = [
  { name: 'private key', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/ },
  { name: 'GitHub fine-grained token', re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
];

const failures = [];
const warnings = [];
let scanned = 0;

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, '/');
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const relative = rel(full);
    if (forbiddenFiles.some(re => re.test(entry.name))) {
      failures.push(`${relative}: forbidden credential/key file type`);
      continue;
    }

    if (!textExts.has(path.extname(entry.name).toLowerCase())) continue;
    scanned += 1;

    let body;
    try {
      body = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }

    for (const pattern of secretPatterns) {
      if (pattern.re.test(body)) {
        failures.push(`${relative}: possible ${pattern.name}`);
      }
    }

    if (relative.endsWith('.html')) {
      const insecureActive = [
        /<script\b[^>]*\bsrc=["']http:\/\//i,
        /<link\b[^>]*\brel=["'][^"']*stylesheet[^"']*["'][^>]*\bhref=["']http:\/\//i,
        /<link\b[^>]*\bhref=["']http:\/\/[^"']+["'][^>]*\brel=["'][^"']*stylesheet/i,
      ];
      if (insecureActive.some(re => re.test(body))) {
        failures.push(`${relative}: active resource loaded over plain HTTP`);
      }

      const externalScripts = [...body.matchAll(/<script\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)].map(m => m[1]);
      if (externalScripts.length) {
        warnings.push(`${relative}: external script(s): ${externalScripts.join(', ')}`);
      }
    }

    if (/\.(?:js|mjs)$/i.test(relative)) {
      if (/\beval\s*\(/.test(body) || /\bnew\s+Function\s*\(/.test(body) || /\bdocument\.write\s*\(/.test(body)) {
        warnings.push(`${relative}: dynamic-code API found; review manually`);
      }
      if (/\b(?:fetch|XMLHttpRequest)\b[\s\S]{0,120}http:\/\//i.test(body)) {
        failures.push(`${relative}: network request appears to use plain HTTP`);
      }
    }
  }
}

walk(ROOT);

const cnamePath = path.join(ROOT, 'CNAME');
if (!fs.existsSync(cnamePath)) {
  failures.push('CNAME: missing custom-domain declaration');
} else {
  const cname = fs.readFileSync(cnamePath, 'utf8').trim();
  if (cname !== 'gruntiwiatr.pl') {
    failures.push(`CNAME: expected gruntiwiatr.pl, found "${cname}"`);
  }
}

console.log(`Security audit scanned ${scanned} text files.`);
for (const warning of warnings) console.warn('WARN:', warning);

if (failures.length) {
  console.error('\nSecurity audit FAILED:');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}

console.log('Security audit passed: no high-confidence secrets, key files or insecure active HTTP resources detected.');
