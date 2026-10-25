import type { WalletInput, WalletRepository } from "../domain/wallet";

export const makeListWallets = (repo: WalletRepository) => (signal?: AbortSignal) => repo.list(signal);
export const makeCreateWallet = (repo: WalletRepository) => (input: WalletInput) => repo.create(input);
export const makeUpdateWallet =
  (repo: WalletRepository) => (id: string, input: WalletInput) => repo.update(id, input);
