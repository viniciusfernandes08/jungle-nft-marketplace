import type { Cart } from "@/features/cart/domain/cart";
import type { Quote, QuoteInput } from "@/features/cart/domain/quote";
import type { Nft } from "@/features/nfts/domain/nft";
import type { Order } from "@/features/orders/domain/order";
import type { Profile } from "@/features/profile/domain/profile";
import type { Wallet } from "@/features/wallets/domain/wallet";
import { buildNfts } from "../fixtures/nfts";
import { buildSeedProfiles } from "../fixtures/profiles";
import { buildSeedUsers, type MockUser } from "../fixtures/users";
import { seedWallets } from "../fixtures/wallets";

export type MockSession = { token: string; userId: string; expiresAt: string };

export type MockQuoteRecord = {
  quote: Quote;
  /** Presente quando a cotação foi feita por um usuário logado. */
  userId?: string;
  input: QuoteInput;
};

export type MockOrderOutcome = "confirmed" | "declined" | "pending";

export type MockOrderRecord = {
  userId: string;
  order: Order;
  /** Resultado escolhido no momento da criação (o cenário pode mudar depois). */
  outcome: MockOrderOutcome;
  confirmAt: string;
};

export type MockIdempotencyRecord = {
  userId: string;
  payload: string;
  orderId: string;
};

export type MockDb = {
  schemaVersion: number;
  users: MockUser[];
  sessions: MockSession[];
  /** userId -> perfil do colecionador */
  profiles: Record<string, Profile>;
  nfts: Nft[];
  /** userId -> ids de NFT favoritados */
  favorites: Record<string, string[]>;
  /** userId -> carrinho da conta */
  carts: Record<string, Cart>;
  /** userId -> carteiras cadastradas */
  wallets: Record<string, Wallet[]>;
  /** quoteId -> cotação persistida (necessária para revalidar o pedido) */
  quotes: Record<string, MockQuoteRecord>;
  /** orderId -> pedido + dono + desfecho simulado */
  orders: Record<string, MockOrderRecord>;
  /** Idempotency-Key -> pedido criado */
  idempotency: Record<string, MockIdempotencyRecord>;
};

const STORAGE_KEY = "kurio:mock-db";
/** Suba este número ao mudar o formato do banco; bancos antigos são descartados. */
const SCHEMA_VERSION = 4;

let cache: MockDb | null = null;
let loading: Promise<MockDb> | null = null;

async function createSeedDb(): Promise<MockDb> {
  return {
    schemaVersion: SCHEMA_VERSION,
    users: await buildSeedUsers(),
    sessions: [],
    profiles: buildSeedProfiles(),
    nfts: buildNfts(),
    favorites: {},
    carts: {},
    wallets: structuredClone(seedWallets),
    quotes: {},
    orders: {},
    idempotency: {},
  };
}

async function load(): Promise<MockDb> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDb;
      if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;
    }
  } catch {
    // storage indisponível ou corrompido: recomeça do seed
  }
  return createSeedDb();
}

export async function getDb(): Promise<MockDb> {
  if (cache) return cache;
  loading ??= load();
  cache = await loading;
  return cache;
}

/** Persiste para sobreviver a refresh. Chame após qualquer mutação. */
export function saveDb(db: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // sem persistência: o estado continua em memória
  }
}

/** Restaura integralmente o estado conhecido do seed. */
export async function resetDb(): Promise<MockDb> {
  cache = null;
  loading = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
  const db = await getDb();
  saveDb(db);
  return db;
}
