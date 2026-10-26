import type { RequestHandler, WebSocketHandler } from "msw";
import { authHandlers } from "./auth.handler";
import { cartHandlers } from "./cart.handler";
import { favoriteHandlers } from "./favorites.handler";
import { nftHandlers } from "./nfts.handler";
import { orderHandlers } from "./orders.handler";
import { profileHandlers } from "./profile.handler";
import { quoteHandlers } from "./quote.handler";
import { socketHandlers } from "./socket.handler";
import { walletConnectionHandlers } from "./wallet-connection.handler";
import { walletHandlers } from "./wallets.handler";

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
  ...walletConnectionHandlers,
  ...socketHandlers,
];
