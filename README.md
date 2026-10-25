# Kurio: Marketplace de NFTs

Marketplace de NFTs em React + TypeScript, com fidelidade ao Figma e fluxo completo de carrinho, checkout e confirmação do pedido. A API REST e o Socket.IO são simulados com MSW, então o projeto roda sem backend.

## Stack

- React 19 + TypeScript + Vite
- TanStack Router (rotas tipadas, guards e busca na URL) e TanStack Query
- Axios (REST) e Socket.IO (tempo real)
- Tailwind CSS v4 + shadcn/ui
- MSW 2 (REST + WebSocket/Socket.IO) e banco local determinístico
- Playwright (E2E) e Lighthouse

## Rodando localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O `.env.development` já vem com `VITE_ENABLE_MOCKS=true`; não é necessário backend.

Para validar o build de demonstração (também com mocks):

```bash
npm run build
npm run preview
```

O `.env.production` está configurado para a demo estática: MSW ativo, API em `/api` e Socket.IO em `/kurio-socket`. Para apontar para uma API real, use `VITE_ENABLE_MOCKS=false` e ajuste `VITE_API_URL`/`VITE_SOCKET_URL` (veja `.env.example`).

## Funcionalidades

- **Home e catálogo:** busca, filtros por coleção/rede/preço, abas, ordenação e paginação; estado na URL e cache por consulta.
- **Detalhe do NFT:** edições, quantidade limitada por estoque, favoritos com atualização otimista e rollback.
- **Carrinho:** visitante (localStorage) e logado (API), mesclagem no login, cupom e cotação reativa. A aritmética de ETH é feita em wei/BigInt.
- **Checkout desktop:** formulário do colecionador com 9 campos obrigatórios, seleção de rede e carteira, provedor, revisão da cotação, revalidação de preço, idempotência e conexão simulada da carteira.
- **Checkout mobile:** somente a etapa da carteira (sem formulário do colecionador), com troca entre as carteiras cadastradas e provedor padrão por carteira.
- **Confirmação:** recibo com status, ID da transação, itens, taxas e total; restauração por `?order=<id>` no refresh; modal no desktop e tela cheia no mobile.
- **Tempo real:** `order.updated` via Socket.IO atualiza a confirmação; polling de 2 s permanece como fallback.
- **Estados de erro:** conexão recusada, pedido recusado, pedido pendente, expiração de sessão e indisponibilidade de ações fora do escopo, sempre com aviso — sem simular sucesso.

## Credenciais e dados de teste

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Souza | `ana@kurio.test` | `Kurio@123` |
| Bruno Lima | `bruno@kurio.test` | `Kurio@123` |

- A conta da Ana já tem as carteiras **Principal** (Ethereum/MetaMask) e **Reserva** (Polygon/Coinbase Wallet).
- Contas novas recebem uma carteira principal no mock, porque a tela de carteiras ainda não existe.
- Cupons: `KURIO10` (10%), `GENESIS20` (20%) e `EXPIRADO10` (expirado).
- Para reproduzir o carrinho do layout, adicione Emerald Ape #042 ×2, Violet Nomad #314 ×6 e Ivory Baron #088 ×9.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento com mocks |
| `npm run build` | Typecheck + build de produção/demo |
| `npm run preview` | Serve o build localmente |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (sobe o Vite em `http://localhost:4173`) |
| `npm run test:e2e:ui` | Playwright em modo UI |
| `npm run test:e2e:report` | Abre o relatório HTML do Playwright |

Na primeira execução do Playwright, instale o navegador:

```bash
npx playwright install chromium
```

## Mocks e cenários

O MSW roda no navegador (service worker) e persiste o banco em `localStorage` (`kurio:mock-db`). O Socket.IO simulado usa o path dedicado `/kurio-socket`.

Ative um cenário pela URL (`/?scenario=<nome>`, fica salvo) ou pelo console:

```js
window.kurioMocks.setScenario("slow")
window.kurioMocks.reset()          // restaura o seed e o cenário default
window.kurioMocks.increasePrice()  // sobe 0.1 ETH na primeira NFT; use antes de confirmar
```

| Cenário | Efeito |
|---|---|
| `default` | Sucesso, latência de 150 ms |
| `empty` | Catálogo vazio |
| `slow` | 2,5 s em toda requisição (skeletons) |
| `variable-latency` | Latências alternadas (1800, 150, 900, 80, 1400 ms): respostas fora de ordem |
| `network-error` | Falha de conexão em tudo |
| `timeout` | Leituras de NFT nunca respondem (estoura o timeout do Axios) |
| `http-500` | Leituras de NFT respondem 500 |
| `http-503` | Tudo responde 503 |
| `session-expired` | Requisições autenticadas respondem 401 `SESSION_EXPIRED` |
| `favorite-error` | Favoritar/desfavoritar responde 500 (rollback otimista) |
| `quote-error` | `POST /api/quote` responde 500 (resumo com erro e retry) |
| `forbidden` | Requisições autenticadas respondem 403 |
| `wallet-refused` | A conexão da carteira é recusada; o checkout oferece tentar novamente |
| `order-declined` | O pedido é recusado após a criação; o carrinho é preservado |
| `order-pending` | O pedido fica pendente; polling/refresh continuam consultando |

Para testar a expiração de sessão: entre, abra `/?scenario=session-expired` e recarregue.

### Revalidação de preço

Com o checkout preenchido, execute `window.kurioMocks.increasePrice()` e clique em **Confirmar compra**. O app refaz a cotação, abre o diálogo com o total anterior e o novo, e só cria o pedido após **Aceitar e confirmar**. O servidor também valida a cotação e responde `409 PRICE_CHANGED` se ela tiver mudado.

## Checkout em detalhes

### Desktop (≥1024px)

Campos obrigatórios: nome de exibição, nome de usuário, rede, nome do perfil, endereço da carteira, tipo de carteira (provedor), código de indicação, e-mail e nome ENS. Opcionais: ENS/carteira secundária, observação e "Usar outra carteira?".

- A rede filtra as carteiras cadastradas; selecionar uma carteira preenche rede e provedor.
- Os dados do colecionador pertencem ao pedido e **não são salvos no perfil**.
- "Usar outra carteira?" é clicável, mas apenas informa que a ação estará disponível em breve.
- O botão de compra fica desabilitado até o formulário ser válido, a cotação estar pronta e a carteira estar conectada.

### Mobile (<1024px)

- Apenas a etapa da carteira, sem formulário do colecionador; os dados do colecionador derivam da sessão e da carteira selecionada.
- "Trocar carteira" alterna entre as carteiras cadastradas. O provedor padrão é MetaMask para a Principal e Coinbase Wallet para a Reserva.
- A cotação acompanha a rede da carteira; a confirmação ocupa a tela inteira.

### Pedido e confirmação

- A cotação é revalidada antes de criar o pedido; se mudou, o novo total exige confirmação.
- A chave de idempotência é gerada no primeiro envio e reutilizada em retries de rede com o mesmo payload; é descartada após sucesso ou conflito.
- O pedido guarda um snapshot imutável de itens, taxas, total, carteira e colecionador.
- O status começa em `pending` e vira `confirmed`/`declined` (cerca de 1,8 s no mock). O evento chega por Socket.IO; há polling de fallback.
- O recibo é restaurado por `/checkout?order=<id>` e o link do explorer varia por rede (Etherscan, Polygonscan, Solscan).

## Testes E2E

A suíte cobre 6 fluxos em `tests/e2e`:

1. Desktop: preenche o formulário, cria o pedido, valida o recibo e restaura a confirmação após refresh.
2. Desktop: revalidação de preço com diálogo e aceite do novo total.
3. Mobile: apenas carteira, troca Reserva → Principal, provedor e confirmação em tela cheia.
4. Mobile: conexão recusada e nova tentativa.
5. Mobile: pedido recusado, motivo e preservação do carrinho.
6. Mobile: pedido pendente com polling e restauração após refresh.

```bash
npm run test:e2e
```

O `playwright.config.ts` inicia o Vite na porta 4173 e reutiliza um servidor existente fora do CI. Cada teste usa um contexto isolado, com banco mock e sessão próprios.

## Lighthouse

Auditoria no build de produção/demo (`vite preview`) da Home, preset mobile padrão:

| Categoria | Nota |
|---|---|
| Performance | **62** (varia 62–69 entre execuções) |
| Acessibilidade | **100** |
| Boas práticas | **100** |
| SEO | **100** |

O relatório HTML da última execução foi gerado localmente em `lighthouse-report.html` (ignorado pelo git).

O que foi corrigido após a primeira auditoria:

- Imagens dos NFTs reduzidas de PNG 1254×1254 (~1,8–2,0 MB cada) para JPEG 800×800 (~100–115 KB), com os originais preservados em `assets-source/nfts/`.
- Preload da imagem LCP e `fetchpriority="high"` nos primeiros cards.
- Alvos dos dots do hero ampliados para 24×24 px sem alterar o ponto visual de 10 px.
- `robots.txt` válido e metadados revisados.

A performance é limitada pelo MSW no build de demonstração: o chunk do mock e o service worker entram no caminho crítico antes do primeiro render (FCP/LCP). Para repetir:

```bash
npm run build
npm run preview -- --port 4174
npx --yes lighthouse http://localhost:4174/ \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=./lighthouse-report.html
```

## Estrutura

```text
src/
  app/            composition root, providers, router, query client
  features/       domain / application / infra / ui por feature
  routes/         arquivos finos do TanStack Router
  components/     shadcn/ui e componentes compartilhados
  lib/            cliente HTTP, utils
  config/         env, assets
  mocks/          MSW (REST, Socket.IO, banco, fixtures, cenários)
  shared/         tipos e regras compartilhadas
tests/e2e/        Playwright
```

As regras de camadas, contratos REST, decisões de tempo real e desvios do Figma estão em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Escopo e limitações desta entrega

- **"Usar outra carteira?":** clicável, mas sem ação por enquanto, conforme o escopo.
- **Ações fora do escopo** (mercado, criadores, artigos, newsletter, login social etc.) avisam indisponibilidade; não fingem sucesso.
- **Mobile:** o checkout implementa somente a parte da carteira, sem o formulário do colecionador.
- **Backend:** não há API real; a demo usa MSW e Socket.IO simulados. Os dados ficam no `localStorage` do navegador.
