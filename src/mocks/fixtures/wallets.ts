import type { Wallet } from "@/features/wallets/domain/wallet";

/**
 * Carteiras cadastradas dos usuários de teste.
 * "Principal" é a carteira EVM padrão; "Reserva" tem ENS e vive na Polygon.
 */
export const seedWallets: Record<string, Wallet[]> = {
  "user-ana": [
    {
      id: "wallet-ana-principal",
      kind: "primary",
      label: "Principal",
      nickname: "Principal",
      displayName: "Ana Souza",
      profileName: "Ana Souza",
      email: "ana@kurio.test",
      referralCode: "ANA2026",
      address: "0xA91F3C2B7D4E5F60718293A4B5C6D7E8F901E82C",
      network: "ethereum",
      provider: "metamask",
    },
    {
      id: "wallet-ana-reserva",
      kind: "secondary",
      label: "Reserva",
      nickname: "Reserva",
      displayName: "Ana Souza",
      profileName: "Ana Reserva",
      email: "ana@kurio.test",
      referralCode: "ANA-RESERVA",
      address: "0xB72E9F4A1C3D5B608192A3B4C5D6E7F80912A4C6",
      network: "polygon",
      ensName: "nova.kurio.eth",
      provider: "coinbase",
    },
  ],
  "user-bruno": [
    {
      id: "wallet-bruno-principal",
      kind: "primary",
      label: "Principal",
      nickname: "Principal",
      displayName: "Bruno Lima",
      profileName: "Bruno Lima",
      email: "bruno@kurio.test",
      referralCode: "BRUNO2026",
      address: "0xC41D8E7F2A3B5C609182A3B4C5D6E7F80912B5D7",
      network: "ethereum",
      provider: "metamask",
    },
  ],
};
