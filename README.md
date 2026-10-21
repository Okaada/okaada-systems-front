# okaada-systems-front

Site institucional da **Okada Systems** — [okadasystems.com.br](https://okadasystems.com.br).

HTML e CSS estáticos, sem framework, sem build e sem JavaScript. Hospedado no Cloudflare Pages.

## Estrutura

```
public/                 ← único diretório publicado
  index.html
  404.html
  _headers              ← CSP e cabeçalhos de segurança (Cloudflare Pages)
  assets/site.css
  assets/fonts/         ← Archivo variável, self-hosted (OFL)
  .well-known/security.txt
scripts/check-static.mjs  ← guarda de CI: impede script/estilo inline e arquivos sensíveis em public/
.github/workflows/ci.yml  ← validação em PR e push na main
```

Tudo fora de `public/` (README, package.json, workflows) **não** é publicado.

## Rodar localmente

```bash
npm ci --ignore-scripts
npm run validate      # html-validate + checagens de segurança
npm run preview       # http://localhost:8080
```

## Deploy (Cloudflare Pages, integração Git)

| Configuração            | Valor     |
|-------------------------|-----------|
| Production branch       | `main`    |
| Framework preset        | None      |
| Build command           | *(vazio)* |
| Build output directory  | `public`  |

Domínio customizado: `okadasystems.com.br` (apex) + redirect 301 de `www` via *Redirect Rules* da zona.

## Regras de segurança

- A CSP em `public/_headers` é `default-src 'none'`. Não adicione `<script>`, `<style>`, `style=""` ou recursos de terceiros sem ajustar a política conscientemente.
- Actions fixadas por SHA; Dependabot com cooldown de 7 dias.
- `.npmrc` desliga scripts de instalação.
