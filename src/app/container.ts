import { makeLogin, makeLogout, makeRegister, makeRestoreSession } from "@/features/auth/application/auth-use-cases";
import { createHttpAuthRepository } from "@/features/auth/infra/http-auth-repository";
import { createLocalTokenStore } from "@/features/auth/infra/local-token-store";
import {
  makeAddCartItem,
  makeGetCart,
  makeMergeGuestCart,
  makeRemoveCartItem,
  makeSetCoupon,
  makeUpdateCartItem,
} from "@/features/cart/application/cart-use-cases";
import { makeApplyCoupon, makeGetQuote } from "@/features/cart/application/quote-use-cases";
import { createCartGateway } from "@/features/cart/infra/cart-gateway";
import { createHttpCartRepository } from "@/features/cart/infra/http-cart-repository";
import { createHttpQuoteRepository } from "@/features/cart/infra/http-quote-repository";
import { createLocalCartRepository } from "@/features/cart/infra/local-cart-repository";
import {
  makeAddFavorite,
  makeListFavorites,
  makeRemoveFavorite,
} from "@/features/favorites/application/favorite-use-cases";
import { createHttpFavoriteRepository } from "@/features/favorites/infra/http-favorite-repository";
import { makeGetNft, makeGetNftFacets, makeListNfts } from "@/features/nfts/application/nft-use-cases";
import { createHttpNftRepository } from "@/features/nfts/infra/http-nft-repository";
import { makeCreateOrder, makeGetOrder } from "@/features/orders/application/order-use-cases";
import { createHttpOrderRepository } from "@/features/orders/infra/http-order-repository";
import {
  makeChangePassword,
  makeGetProfile,
  makeUpdateAvatar,
  makeUpdateProfile,
} from "@/features/profile/application/profile-use-cases";
import { createHttpProfileRepository } from "@/features/profile/infra/http-profile-repository";
import { createSocketIoRealtimeGateway } from "@/features/realtime/infra/socket-io-gateway";
import {
  makeConnectWallet,
  makeDisconnectWallet,
} from "@/features/wallets/application/wallet-connection-use-cases";
import {
  makeCreateWallet,
  makeListWallets,
  makeUpdateWallet,
} from "@/features/wallets/application/wallet-use-cases";
import { createHttpWalletConnectionRepository } from "@/features/wallets/infra/http-wallet-connection-repository";
import { createHttpWalletRepository } from "@/features/wallets/infra/http-wallet-repository";
import { configureHttpAuth, http } from "@/lib/http";

/**
 * Composition root: único lugar que conhece infra E application.
 * Cada feature registra aqui: repositório (infra) -> use cases (application).
 * A ui consome o resultado via hooks; application e domain nunca importam infra.
 */
const tokenStore = createLocalTokenStore();
configureHttpAuth({ getToken: () => tokenStore.get() });

const authRepository = createHttpAuthRepository(http);
const nftRepository = createHttpNftRepository(http);
const favoriteRepository = createHttpFavoriteRepository(http);

const guestCart = createLocalCartRepository();
const accountCart = createHttpCartRepository(http);
const cartRepository = createCartGateway({
  guest: guestCart,
  account: accountCart,
  isAuthenticated: () => tokenStore.get() !== null,
});
const quoteRepository = createHttpQuoteRepository(http);
const orderRepository = createHttpOrderRepository(http);
const profileRepository = createHttpProfileRepository(http);
const walletRepository = createHttpWalletRepository(http);
const walletConnectionRepository = createHttpWalletConnectionRepository(http);
const mergeGuestCart = makeMergeGuestCart(guestCart, accountCart);
const realtime = createSocketIoRealtimeGateway();

const login = makeLogin(authRepository, tokenStore);
const register = makeRegister(authRepository, tokenStore);

const withGuestCartMerge = <I,>(authenticate: (input: I) => ReturnType<typeof login>) =>
  async (input: I) => {
    const session = await authenticate(input);
    await mergeGuestCart().catch(() => undefined);
    return session;
  };

export const container = {
  auth: {
    tokens: tokenStore,
    register: withGuestCartMerge(register),
    login: withGuestCartMerge(login),
    logout: makeLogout(authRepository, tokenStore),
    restoreSession: makeRestoreSession(authRepository, tokenStore),
  },
  nfts: {
    list: makeListNfts(nftRepository),
    get: makeGetNft(nftRepository),
    facets: makeGetNftFacets(nftRepository),
  },
  favorites: {
    list: makeListFavorites(favoriteRepository),
    add: makeAddFavorite(favoriteRepository),
    remove: makeRemoveFavorite(favoriteRepository),
  },
  cart: {
    get: makeGetCart(cartRepository),
    addItem: makeAddCartItem(cartRepository),
    updateItem: makeUpdateCartItem(cartRepository),
    removeItem: makeRemoveCartItem(cartRepository),
    setCoupon: makeSetCoupon(cartRepository),
  },
  quote: {
    get: makeGetQuote(quoteRepository),
    applyCoupon: makeApplyCoupon(quoteRepository, cartRepository),
  },
  orders: {
    create: makeCreateOrder(orderRepository),
    get: makeGetOrder(orderRepository),
  },
  profile: {
    get: makeGetProfile(profileRepository),
    update: makeUpdateProfile(profileRepository),
    updateAvatar: makeUpdateAvatar(profileRepository),
    changePassword: makeChangePassword(profileRepository),
  },
  wallets: {
    list: makeListWallets(walletRepository),
    create: makeCreateWallet(walletRepository),
    update: makeUpdateWallet(walletRepository),
  },
  walletConnection: {
    connect: makeConnectWallet(walletConnectionRepository),
    disconnect: makeDisconnectWallet(walletConnectionRepository),
  },
  realtime,
} as const;
