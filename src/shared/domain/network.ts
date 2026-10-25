export const networkIds = ["ethereum", "polygon", "solana"] as const;
export type NetworkId = (typeof networkIds)[number];

export const networkLabels: Record<NetworkId, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  solana: "Solana",
};
