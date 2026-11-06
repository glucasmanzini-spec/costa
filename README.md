# Costa — Cloudflare Workers + Workers AI

Costa é uma aplicação React/Vite servida por um Cloudflare Worker. O backend de chat usa Cloudflare Workers AI.

## Configurar o deploy pelo GitHub

No painel Cloudflare, abra **Workers & Pages → costaai → Settings → Build** e configure:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** `/` (raiz do repositório, ou deixe em branco se o painel usar a raiz como padrão)
- **Production branch:** `main`

O comando de build precisa ser executado antes do deploy: ele gera a pasta `dist/` usada em `wrangler.toml`. Não deixe o Build command vazio.

Depois salve e use **Retry build**. A etapa de build deve mostrar o Vite gerando `dist/index.html`; só depois deve começar o Wrangler deploy.

## Desenvolvimento local

```bash
npm install
npm run build
npx wrangler dev
```

## Modelo de IA

O código usa `@cf/ibm-granite/granite-4.0-h-micro`, hospedado pelo Cloudflare Workers AI. O histórico enviado ao modelo é limitado às últimas 8 mensagens.

## Limitações desta versão

- Conversas e personagens criados ficam no estado da página; ainda não há persistência em banco de dados.
- Não há login, sincronização entre dispositivos ou moderação avançada.
- A cota Workers AI é medida em Neurons, não em quantidade fixa de mensagens.

## Documentação

- Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/configuration/
- Workers AI: https://developers.cloudflare.com/workers-ai/
