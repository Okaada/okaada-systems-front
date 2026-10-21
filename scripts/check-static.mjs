// Guarda de CI: garante que nada quebre a CSP estrita definida em public/_headers.
// Sem dependências — só módulos nativos do Node.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "public";
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROOT);

for (const file of files.filter((f) => extname(f) === ".html")) {
  const html = readFileSync(file, "utf8");
  const rules = [
    [/<script\b/i, "tag <script> (CSP bloqueia scripts)"],
    [/\sstyle\s*=/i, "atributo style= inline (CSP bloqueia estilos inline)"],
    [/<style\b/i, "bloco <style> inline"],
    [/\son[a-z]+\s*=/i, "handler de evento inline (onclick=...)"],
    [/(src|href)\s*=\s*["']http:\/\//i, "recurso via http:// sem TLS"],
    [/(src)\s*=\s*["']https?:\/\//i, "recurso carregado de domínio externo"],
  ];
  for (const [re, msg] of rules) if (re.test(html)) errors.push(`${file}: ${msg}`);

  // links externos que abrem em nova aba precisam de rel=noopener
  for (const m of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    if (!/rel=["'][^"']*noopener/i.test(m[0])) errors.push(`${file}: target=_blank sem rel=noopener`);
  }
}

const headers = readFileSync(join(ROOT, "_headers"), "utf8");
for (const h of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "frame-ancestors 'none'"]) {
  if (!headers.includes(h)) errors.push(`_headers: falta ${h}`);
}

const forbidden = files.filter((f) => /(^|\/)(\.env|.*\.pem|.*\.key|package(-lock)?\.json)$/.test(f));
for (const f of forbidden) errors.push(`${f}: arquivo sensível dentro do diretório publicado`);

if (errors.length) {
  console.error("Falhas encontradas:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`OK: ${files.length} arquivos verificados em ${ROOT}/`);
