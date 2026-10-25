# Arquitetura

Feature-based com clean architecture. Cada feature em `src/features/<feature>/` tem quatro camadas:

| Camada | Pode conter | Pode importar |
|---|---|---|
| `domain` | entities, contratos (interfaces de repositório/gateway, erros, tipos de evento) e regras puras | nada |
| `application` | use cases (passthrough ao repositório ou regra simples) | `domain` |
| `infra` | repositórios Axios, DTOs e mappers, cliente Socket.IO, persistência local | `domain`, `lib` |
| `ui` | páginas, componentes, hooks do TanStack Query, skeletons | `application`, `domain` (tipos) |

`src/app/container.ts` é a composition root: liga infra aos use cases. `src/routes/` contém só arquivos finos do TanStack Router que delegam para `features/*/ui`.

Fora das features: `src/lib` (utils, cliente HTTP), `src/components` (shadcn e componentes genéricos), `src/config` (env, assets), `src/mocks` (MSW).

## Cache e retries (TanStack Query)
Definidos em `src/app/query-client.ts`:
- `staleTime` 30s, `gcTime` 5min, refetch ao focar a janela e ao reconectar.
- Queries: até 2 retries com backoff exponencial (1s, 2s, teto 8s), apenas para rede, timeout, 5xx, 408 e 429. 4xx determinístico não é repetido.
- Mutations: sem retry automático. Pedidos usam chave de idempotência e retry explícito.

## Decisões e desvios do Figma
- Raios: 24px como padrão (`--radius`), exceto onde o layout tem bordas retas.
- Cor de texto sobre o botão primário, cor de erro e line-heights são provisórios (não estão nos prints).

## Contratos REST (implementados)
Erros seguem `ApiErrorBody` (`{ code, message, fieldErrors? }`). Status: 401 (`UNAUTHORIZED`, `SESSION_EXPIRED`, `INVALID_CREDENTIALS`), 403 (`FORBIDDEN`), 404 (`NOT_FOUND`), 409 (`EMAIL_TAKEN`), 422 (`VALIDATION_ERROR`), 5xx (transitório).

| Método e rota | Corpo / query | Resposta |
|---|---|---|
| `POST /api/auth/register` | `{ fullName, email, password }` | 201 `{ token, session }` |
| `POST /api/auth/login` | `{ email, password }` | 200 `{ token, session }` |
| `GET /api/auth/session` | Bearer token | 200 `Session` |
| `POST /api/auth/logout` | Bearer token | 204 |
| `GET /api/nfts` | `search`, `collection` (repetível), `network` (repetível), `minPrice`, `maxPrice`, `tab` (`all\|new\|trending`), `sort` (`recent\|price-asc\|price-desc\|name`), `page`, `pageSize` | 200 `Page<Nft>` |
| `GET /api/nfts/facets` | | 200 `NftFacets` (contagens e faixa de preço) |
| `GET /api/nfts/:id` | | 200 `Nft` ou 404 |

Valores em ETH são strings decimais; quantidades são inteiras. A aritmética usa wei (`bigint`) em `src/shared/domain/eth.ts`.

## Tempo real (contrato de domain)
Eventos `nft.updated` e `order.updated` carregam `eventId`, `resource`, `version` e, quando privados, `userId`. `shouldApplyEvent` descarta duplicatas, versões antigas e eventos de outro usuário. O transporte e as limitações do mock estão na seção [Tempo real](#tempo-real-socketio).

## Mocks
Banco em `src/mocks/db`, fixtures determinísticas (PRNG com semente fixa) em `src/mocks/fixtures`, cenários em `src/mocks/scenarios.ts`. Latência e falhas são aplicadas por `withScenario`, na camada de rede. Componentes, hooks e o cliente Axios não têm respostas fictícias.

## Catálogo e Home
- **URL como fonte de verdade**: `q`, `collection`, `network`, `min`, `max`, `tab`, `sort` e `page` ficam na query string (`catalog-search.ts`). Valores padrão são omitidos; valores inválidos são descartados. Mudar qualquer filtro remove `page`. Os arrays usam o formato JSON do TanStack Router (ex.: `collection=%5B%22arte-digital%22%5D`).
- **Cache por consulta**: a consulta inteira compõe a query key (`nftKeys.list(query)`). `keepPreviousData` evita piscar na paginação, e o `AbortSignal` cancela requisições obsoletas.
- **Erros**: a infra converte Axios em `DomainError` (`shared/infra/map-http-error.ts`). Só `transient` é repetido pelo Query. Cancelamentos passam intactos.
- **Responsividade**: a sidebar de filtros e o header só existem a partir de `lg` (1024px). Abaixo disso há busca + drawer de filtros (`<dialog>` nativo), bottom nav e grade de 2 colunas (3 em `md`).
- **Ações fora do escopo** (Mercado/Criadores/Aprenda, links de ajuda, artigos, newsletter, scanner): `UnavailableLink` e `useAnnounce` avisam por região `aria-live` e por aviso visual, sem fingir sucesso.

### Desvios do Figma
- Filtros de coleção e rede mostram checkbox visível (o estado não depende só de cor, e permite combinar filtros).
- No mobile a ordenação fica dentro do drawer de filtros; no desktop, na toolbar.
- O hero não tem autoplay (acessibilidade); a troca é pelos pontos.

## Conta e sessão
- **Rotas**: `/login` e `/register` existem em todos os tamanhos. No desktop (`>= 1024px`) a rota renderiza a Home atrás de um modal (`<dialog>` nativo); abaixo disso, tela cheia sem footer nem bottom nav. Fechar o modal volta ao histórico (ou vai para `/` em acesso direto).
- **Retorno ao fluxo**: `?redirect=<caminho>`. Só caminhos internos são aceitos (`redirect.ts`); `/login` e `/register` são rejeitados para evitar laço. Quem já está autenticado é redirecionado para fora das telas de acesso.
- **Token**: Bearer opaco em `localStorage` (`kurio:auth-token`), anexado por um interceptor do Axios. A sessão é recuperada após refresh por `restoreSession` (sem token não chama a API).
- **Expiração**: qualquer 401 numa requisição autenticada (exceto logout) dispara `setupSessionExpiry`: descarta o token e o cache privado, avisa por `aria-live` e chama `router.invalidate()`, o que reexecuta os guards (rotas privadas levam ao login com `redirect`).
- **Isolamento entre usuários**: login, cadastro, logout e expiração removem do cache toda chave que não seja `nfts` ou `session` (as chaves de novas features são privadas por padrão). Subscriptions do Socket.IO serão encerradas na mesma ponta quando a etapa de tempo real entrar.
- **Senhas**: os mocks guardam apenas hash com salt (SHA-256). A confirmação de senha é validada só no cliente.

### Desvios do Figma
- Os campos têm rótulo acessível (visível só para leitores de tela); visualmente seguem o placeholder do layout.
- Login com Google/Facebook e "Esqueceu a senha?" avisam que não estão disponíveis.
- No mobile, enquanto não existe a tela de perfil, "Sair" só aparece no header do desktop.

## Detalhe do NFT, favoritos e carrinho (dados)
- **Contrato do NFT**: além de preço e imagem, traz `tokenId`, `seriesName`, `attributes`, `rating`/`ratingCount`, `summary` e `details`. As edições têm rótulo (`1/1`, `1/10`, `1/50`, `ABERTA`); o **preço é do NFT**, a edição define só a disponibilidade.
- **Quantidade**: o limite é `min(disponível, 10) - o que já está no carrinho`. A UI deriva o valor mostrado desse limite (sem efeitos), e a API valida de novo (409 `OUT_OF_STOCK`).
- **Favoritos**: chave `["favorites", userId]`. A atualização é otimista (`onMutate`), faz rollback em `onError` com aviso e sempre reconcilia com a API em `onSettled`. Sem sessão, o coração leva ao login com retorno para a página.
- **Carrinho**: chave `["cart", scope]`, onde `scope` é o id do usuário ou `guest`. Visitante: `localStorage` (`kurio:guest-cart`). Com sessão: API. `createCartGateway` escolhe o repositório pela presença do token. No login/cadastro, `withGuestCartMerge` (container) chama `POST /api/cart/merge`; se falhar, os itens ficam guardados no navegador.
- **Abas e carrossel**: abas com `role="tablist"` e setas do teclado; avaliações ainda indisponíveis (aviso na aba). O carrossel usa scroll-snap, pontos de página e não tem autoplay.

### Contratos REST adicionados
| Método e rota | Corpo | Resposta |
|---|---|---|
| `GET /api/favorites` | | 200 `string[]` (ids) |
| `PUT /api/favorites/:nftId` | | 200 `string[]` |
| `DELETE /api/favorites/:nftId` | | 200 `string[]` |
| `GET /api/cart` | | 200 `Cart` |
| `POST /api/cart/items` | `{ nftId, editionId, quantity }` | 201 `Cart` (soma à quantidade existente; 409 sem estoque) |
| `PATCH /api/cart/items` | `{ nftId, editionId, quantity }` | 200 `Cart` |
| `DELETE /api/cart/items/:nftId/:editionId` | | 200 `Cart` |
| `POST /api/cart/merge` | `{ items }` | 200 `Cart` (ignora o inexistente e limita ao estoque) |
| `PUT /api/cart/coupon` | `{ couponCode? }` | 200 `Cart` |

### Desvios do Figma
- Cabeçalhos e rótulos corrigidos: "Direitos autorais" e "Contrato" estavam trocados no layout.
- As miniaturas repetem a mesma imagem nos mocks (sem arquivos novos).

## Carrinho, cupom e cotação
- **Fonte dos dados da linha**: o carrinho guarda só `nftId`, `editionId` e quantidade. Nome, imagem, preço e disponibilidade vêm da **cotação** (`POST /api/quote`), que é a referência para valores. O total de cada linha acompanha a quantidade na hora (`mulEthByInt`); o resumo usa a cotação e fica esmaecido (`aria-busy`) enquanto ela atualiza.
- **Cotação**: chave `["quote", scope, items, couponCode]`, com `keepPreviousData`. Cada alteração cancela a consulta anterior. É pública (visitante e logado); aceita `network` para a taxa (Ethereum 0,016, Polygon 0,004, Solana 0,001).
- **Atualização otimista** em quantidade e remoção (`mutationKey` único): `onMutate` altera o cache, `onError` faz rollback com aviso (ex.: "Só restam 3 unidades"), e a reconciliação com a API só ocorre quando a última mutação termina.
- **Cupom**: `applyCoupon` pede a cotação com o código candidato e só chama `setCoupon` se o status for `applied`. `invalid` e `expired` não alteram o carrinho. Se um cupom salvo expirar depois, a cotação devolve o status e a tela oferece "Remover".
- **Problemas por linha** (`QuoteIssue`): `OUT_OF_STOCK`, `INSUFFICIENT_STOCK` (com "Ajustar para N") e `PRICE_CHANGED`. Qualquer problema bloqueia "Conectar e finalizar".
- **Finalizar**: sem sessão leva ao login com `redirect=/checkout`; `/checkout` é uma rota privada (`requireAuth`).

### Contrato REST adicionado
| Método e rota | Corpo | Resposta |
|---|---|---|
| `POST /api/quote` | `{ items, couponCode?, network? }` | 200 `Quote` (`couponStatus`: `applied`, `invalid` ou `expired`) |

### Desvios do Figma
- Cabeçalho "Edições" da tabela virou "Quantidade" (é o controle de quantidade).
- Mobile: lixeira visível em todas as linhas (no layout aparece só na terceira, sobreposta ao "+").
- IDs de token e badge do header vêm dos dados, não dos valores de exemplo do layout.

## Checkout e confirmação

- **Composição:** `CheckoutFlow` (UI) orquestra as queries (`useCart`, `useWallets`, `useCartQuote`, `useOrder`) e chama os use cases pelo `container`. Regras puras ficam em `features/checkout/domain` e `features/orders/domain`; Axios/Socket.IO ficam em `infra`.
- **Formulário desktop:** React Hook Form + Zod. Os 9 obrigatórios têm `aria-required`; a lista de campos e a ordem do layout ficam em `desktop-checkout.tsx`. A rede filtra as carteiras; escolher uma carteira sincroniza rede e provedor. O cartão "Usar outra carteira?" é um controle indisponível: avisa por `aria-live` e não altera o formulário.
- **Formulário mobile:** apenas carteira e provedor. A carteira com ENS (a "Reserva") é a preferida; "Trocar carteira" percorre a lista. Os dados do colecionador são derivados da sessão e da carteira selecionada, e não são persistidos no perfil.
- **Conexão da carteira:** `useWalletConnection` guarda `idle | connecting | connected | refused`, chama `POST /api/wallet-connection/connect` e evita reconectar o mesmo provedor quando ele já está conectado/conectando. Uma recusa mostra o motivo e libera "Tentar novamente".
- **Revalidação:** antes do pedido a UI refaz `POST /api/quote` com a rede escolhida. Se `hasQuoteChanged` for verdadeiro, abre o diálogo com total anterior/novo e exige aceite. O servidor repete a validação sobre a cotação persistida e o catálogo atual; uma corrida devolve `409 PRICE_CHANGED`.
- **Idempotência:** a chave é enviada em `Idempotency-Key`. Em falha transitória, `retryRef` guarda payload + chave e o retry repete a mesma requisição. Sucesso ou `409` descartam a chave. O mock associa chave, usuário e payload canônico; reutilizar a chave com outro payload devolve `409 IDEMPOTENCY_KEY_REUSED`.
- **Snapshot:** o pedido guarda itens (nome, edição, imagem, quantidade, preço unitário e total da linha), cupom, subtotal, desconto, taxa, total, rede, carteira e colecionador. Alterações posteriores no catálogo não mudam o recibo.
- **Confirmação:** `/checkout?order=<id>` restaura o pedido; `useOrder` busca o detalhe e faz polling de 2 s apenas enquanto `status === "pending"`. O recibo desktop é um `<dialog>`; no mobile é uma tela cheia com o mesmo conteúdo. O explorer é escolhido pela rede (`Etherscan`, `Polygonscan`, `Solscan`).

### Contratos REST adicionados

| Método e rota | Corpo / header | Resposta |
|---|---|---|
| `GET /api/wallets` | Bearer | 200 `Wallet[]` (cria a carteira principal na primeira listagem de conta sem carteiras, só no mock) |
| `POST /api/wallets` | `{ kind, label, address, network, ensName?, provider? }` | 201 `Wallet` |
| `PUT /api/wallets/:id` | mesmo corpo | 200 `Wallet` |
| `POST /api/wallet-connection/connect` | `{ providerId }` | 200 `{ status: "connected" \| "refused", providerId, reason?, connectedAt? }` |
| `POST /api/wallet-connection/disconnect` | Bearer | 200 `null` |
| `POST /api/orders` | `Idempotency-Key` + `CreateOrderInput` | 201 `Order` (`pending`) ou 409 `PRICE_CHANGED`/`IDEMPOTENCY_KEY_REUSED` |
| `GET /api/orders/:id` | Bearer | 200 `Order` ou 404 `ORDER_NOT_FOUND` |

Erros de validação de carteira/rede/endereço usam `422 VALIDATION_ERROR` com `fieldErrors` (por exemplo, `collector.walletAddress`). A cotação precisa pertencer ao usuário, ter a mesma versão/total/cupom/rede do corpo e continuar igual ao catálogo; o carrinho também precisa coincidir.

### Estados do pedido

`pending` é o estado inicial. O mock agenda a finalização (~1,8 s) e emite `order.updated`; os cenários `order-declined` e `order-pending` alteram o desfecho. O cliente atualiza o cache pelo evento e invalida o carrinho quando o pedido é confirmado; o polling cobre evento perdido. O recibo não finge sucesso: em `declined`, mostra o motivo e mantém o carrinho.

## Tempo real (Socket.IO)

- O contrato de eventos e `shouldApplyEvent` estão em `features/realtime/domain`; o `RealtimeProvider` assina uma vez por sessão e atualiza `orderKeys.detail`/`nftKeys`.
- O gateway (`socket-io-gateway.ts`) importa `socket.io-client` **dinamicamente** depois que o MSW sobe. O `engine.io-client` captura `globalThis.WebSocket` no topo do módulo; importar antes do service worker faria o cliente usar o WebSocket nativo e escapar do mock.
- O path é dedicado (`VITE_SOCKET_PATH=/kurio-socket`) para não capturar o HMR do Vite. O MSW resolve paths relativos como `http`, então o handler usa o wildcard `*/kurio-socket` e o cliente usa `ws://`; o binding `@mswjs/socket.io-binding` faz o handshake.
- Eventos são emitidos para todas as conexões e filtrados no cliente por `userId`/versão. Listeners de sockets antigos ignoram eventos quando a instância não é mais a ativa. O polling de 2 s permanece como fallback.
- No mock, `order.updated` e `nft.updated` saem de `src/mocks/lib/realtime.ts`. O broadcast só ocorre se houver clientes; a confirmação também é recuperável por `GET /api/orders/:id`.

## Build, imagens e Lighthouse

- As imagens dos NFTs são JPEG 800×800 (qualidade padrão do encoder) em `public/images/nfts`; os PNGs originais 1254×1254 ficam em `assets-source/nfts` e não entram no build. A Home usa preload da imagem do primeiro card e `fetchpriority="high"` nos três primeiros cards.
- O hero tem dots com área clicável de 24×24 px e ponto visual de 10 px. `public/robots.txt` é estático.
- Resultado no preview de produção (preset mobile): Performance 62–69, Acessibilidade 100, Boas práticas 100, SEO 100. O FCP/LCP é penalizado pelo MSW no caminho crítico (chunk do mock + service worker); o build de demonstração prioriza rodar sem backend.
- Para uma API real, `VITE_ENABLE_MOCKS=false` remove o chunk do mock do caminho crítico.

## Testes E2E

- `playwright.config.ts` sobe o Vite em `http://localhost:4173`, reutiliza servidor existente fora do CI e usa Chromium.
- `tests/e2e/support/checkout.ts` centraliza login, seed do carrinho via API mockada, abertura do checkout e seleção da primeira carteira.
- Os testes usam contextos isolados (localStorage/banco por teste). A suíte cobre desktop, mobile, revalidação, recusa de carteira, pedido recusado e pendente; ver README.
