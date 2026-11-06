# Costa — Cloudflare Pages + Workers AI

Costa é uma plataforma inicial de personagens de IA. A interface usa React/Vite; o backend é uma Cloudflare Pages Function e a inferência usa Cloudflare Workers AI.

## Publicar pela interface (sem terminal)

1. No painel Cloudflare, abra **Workers & Pages**.
2. Selecione **Create application** → **Pages** → **Connect to Git**.
3. Conecte GitHub e selecione `glucasmanzini-spec/costa`.
4. Configure o projeto:
   - Production branch: `main`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Abra **Settings → Functions → Workers AI** e adicione um binding:
   - Variable name: `AI`
   - Service: **Workers AI**
6. Salve e faça um novo deploy.
7. O endereço padrão será `https://costa.pages.dev`, se o nome estiver disponível.

## Modelo econômico selecionado

O código está configurado para `@cf/ibm-granite/granite-4.0-h-micro`. É um modelo da IBM hospedado pela Cloudflare, não a API da OpenAI. O pacote limita o histórico a 8 mensagens, cada mensagem a 1.800 caracteres, descrição a 1.200 caracteres e resposta a 300 tokens para reduzir consumo de Neurons.

## Limitações desta versão

- As conversas e personagens personalizados ficam apenas na memória da página; atualizar a página pode apagar o histórico.
- Não há login, sincronização, banco de dados D1, limites por usuário ou moderação avançada.
- Antes de abrir ao público, adicione controle de abuso e limites por IP/conta para proteger a cota gratuita.
- A franquia de Workers AI é medida em Neurons e não garante uma quantidade fixa de mensagens nem disponibilidade ilimitada.

## Documentação oficial

- Pages: https://developers.cloudflare.com/pages/
- Pages Functions: https://developers.cloudflare.com/pages/functions/
- Workers AI: https://developers.cloudflare.com/workers-ai/
