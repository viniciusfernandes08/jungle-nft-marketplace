import { networkLabels, type NetworkId } from "@/shared/domain/network";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function networkDisplay(network: NetworkId): string {
  return network === "ethereum" ? "Rede principal Ethereum" : `Rede ${networkLabels[network]}`;
}

export function explorerName(network: NetworkId): string {
  return network === "ethereum" ? "Etherscan" : network === "polygon" ? "Polygonscan" : "Solscan";
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export function shortenTransactionRef(ref: string): string {
  if (ref.length <= 12) return ref;
  return `${ref.slice(0, 2)}${ref.slice(2, 6).toUpperCase()}...${ref.slice(-4).toUpperCase()}`;
}

const USERNAME_ALLOWED = /[^a-zA-Z0-9._-]/g;
const ENS_LABEL_ALLOWED = /[^a-z0-9.-]/g;

export function sanitizeUsername(value: string): string {
  const normalized = value.trim().replace(USERNAME_ALLOWED, "").slice(0, 40);
  return normalized.length >= 3 ? normalized : `colecionador${normalized}`;
}

export function sanitizeEnsLabel(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(ENS_LABEL_ALLOWED, "")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 60);
  return normalized.length >= 2 ? normalized : "colecionador";
}
