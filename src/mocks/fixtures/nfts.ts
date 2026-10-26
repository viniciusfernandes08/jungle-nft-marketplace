import type { Collection, Nft, NftEdition, Rarity } from "@/features/nfts/domain/nft";
import { weiToEth } from "@/shared/domain/eth";
import { networkLabels, type NetworkId } from "@/shared/domain/network";
import { createPrng } from "../lib/prng";

export const collections: Collection[] = [
  { id: "arte-digital", name: "Arte digital" },
  { id: "fotografia", name: "Fotografia" },
  { id: "musica", name: "Música" },
  { id: "arte-3d", name: "Arte 3D" },
  { id: "colecionaveis", name: "Colecionáveis" },
  { id: "generativa", name: "Generativa" },
  { id: "jogos", name: "Jogos" },
  { id: "assinaturas", name: "Assinaturas" },
  { id: "utilidade", name: "Utilidade" },
];

const IMG = {
  emerald: "/images/nfts/emerald-ape.jpg",
  sage: "/images/nfts/sage-nomad.jpg",
  neon: "/images/nfts/neon-vessel.jpg",
  golden: "/images/nfts/golden-beat.jpg",
} as const;

type Base = { name: string; price: string; original?: string; image: string; network: NetworkId };

const FROM_FIGMA: Base[] = [
  { name: "Emerald Ape #042", price: "1.19", image: IMG.emerald, network: "ethereum" },
  { name: "Sage Nomad #009", price: "1.69", image: IMG.sage, network: "polygon" },
  { name: "Neon Vessel #552", price: "1.99", original: "2.29", image: IMG.neon, network: "ethereum" },
  { name: "Cosmic Bloom #118", price: "1.29", image: IMG.sage, network: "solana" },
  { name: "Violet Nomad #314", price: "1.39", image: IMG.sage, network: "ethereum" },
  { name: "Ivory Baron #088", price: "1.79", image: IMG.neon, network: "polygon" },
  { name: "Golden Beat #207", price: "0.99", image: IMG.golden, network: "ethereum" },
  { name: "Golden Pulse #121", price: "0.79", image: IMG.golden, network: "solana" },
  { name: "Golden Signal #160", price: "0.39", image: IMG.golden, network: "polygon" },
];

const ADJECTIVES = ["Amber", "Onyx", "Lunar", "Solar", "Mossy", "Velvet", "Rustic", "Cobalt", "Ember"];
const NOUNS = ["Ape", "Nomad", "Vessel", "Baron", "Bloom", "Beat", "Signal", "Totem", "Drift"];
const IMAGES = Object.values(IMG);
const NETWORKS: NetworkId[] = ["ethereum", "polygon", "solana"];
const CREATORS = ["Marina Alves", "Teo Barros", "Lia Montenegro", "Caio Ferraz", "Nina Sato"];
const SERIES = ["Kurio Apes", "Kurio Nomads", "Kurio Barons", "Golden Era"];
const ATTRIBUTES = ["Óculos", "Esmeralda", "Raro", "Chapéu", "Fones", "Dourado", "Jaqueta", "Capuz", "Lunar"];
const EDITION_LABELS = ["1/1", "1/10", "1/50", "ABERTA"];
const BASE_DATE = Date.parse("2026-09-15T12:00:00Z");
const SIX_HOURS = 6 * 60 * 60 * 1000;

export function buildNfts(): Nft[] {
  const rand = createPrng(42);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];

  const bases: Base[] = [...FROM_FIGMA];
  for (let i = FROM_FIGMA.length; i < 36; i++) {
    const cents = 20 + Math.floor(rand() * 1180);
    bases.push({
      name: `${pick(ADJECTIVES)} ${pick(NOUNS)} #${String(100 + Math.floor(rand() * 900))}`,
      price: weiToEth(BigInt(cents) * 10n ** 16n),
      image: pick(IMAGES),
      network: pick(NETWORKS),
    });
  }

  return bases.map((base, index): Nft => {
    const id = `nft-${String(index + 1).padStart(3, "0")}`;
    const first = index === 0;
    const soldOut = index === 7; // um NFT esgotado para o cenário de edição indisponível
    const editionCount = first ? 4 : 1 + Math.floor(rand() * 4);
    const printCart = index === 4 || index === 5;
    const editions: NftEdition[] = Array.from({ length: editionCount }, (_, n) => {
      const rolled = soldOut || first ? 0 : Math.floor(rand() * 9);
      return {
        id: `${id}-ed-${n + 1}`,
        label: EDITION_LABELS[n],
        available: soldOut
          ? 0
          : first
            ? [1, 6, 8, 20][n]
            : printCart
              ? Math.max(rolled, 12)
              : rolled,
      };
    });
    const rarity: Rarity = index % 4 === 1 || first ? "rare" : "common";
    const creator = CREATORS[index % CREATORS.length];
    const networkLabel = networkLabels[base.network];
    const attributes = first
      ? ["Óculos", "Esmeralda", "Raro"]
      : [...new Set([pick(ATTRIBUTES), pick(ATTRIBUTES), pick(ATTRIBUTES)])];
    const tokenNumber = base.name.match(/#(\d+)/)?.[1] ?? String(index);

    return {
      id,
      name: base.name,
      collectionId: collections[index % collections.length].id,
      seriesName: SERIES[index % SERIES.length],
      tokenId: tokenNumber.padStart(4, "0"),
      network: base.network,
      creator,
      summary: `Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na ${networkLabel}, com arte desbloqueável e acesso para colecionadores.`,
      details: {
        paragraphs: [
          `${base.name} é uma obra digital finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na ${networkLabel}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
          `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. ${creator} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
        ],
        networkNote: `Cunhado na ${networkLabel} com procedência imutável e metadados armazenados no IPFS.`,
        royaltiesNote:
          "Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.",
        contractNote:
          base.network === "solana"
            ? "7xKX...9pQ2 • Programa de NFT verificado."
            : "0x7A42...19E8 • Contrato inteligente ERC-721 verificado.",
      },
      attributes,
      rating: first ? 4.8 : Math.round((4 + rand()) * 10) / 10,
      ratingCount: first ? 19 : 3 + Math.floor(rand() * 57),
      priceEth: base.price,
      originalPriceEth: base.original,
      rarity,
      imageUrl: base.image,
      gallery: [base.image, base.image, base.image, base.image],
      editions,
      trending: index % 3 === 0,
      listedAt: new Date(BASE_DATE - index * SIX_HOURS).toISOString(),
      version: 1,
    };
  });
}
