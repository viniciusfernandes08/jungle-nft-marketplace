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
  userId?: string;
  input: QuoteInput;
};

export type MockOrderOutcome = "confirmed" | "declined" | "pending";

export type MockOrderRecord = {
  userId: string;
  order: Order;
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
  profiles: Record<string, Profile>;
  nfts: Nft[];
  favorites: Record<string, string[]>;
  carts: Record<string, Cart>;
  wallets: Record<string, Wallet[]>;
  quotes: Record<string, MockQuoteRecord>;
  orders: Record<string, MockOrderRecord>;
  idempotency: Record<string, MockIdempotencyRecord>;
};

const STORAGE_KEY = "kurio:mock-db";
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
  } catch {}
  return createSeedDb();
}

export async function getDb(): Promise<MockDb> {
  if (cache) return cache;
  loading ??= load();
  cache = await loading;
  return cache;
}

export function saveDb(db: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

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
