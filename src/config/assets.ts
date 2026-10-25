export const iconNames = [
  "search",
  "cart",
  "heart",
  "heart-filled",
  "user",
  "login",
  "filters",
  "scan",
  "home",
  "arrow-right",
  "chevron-right",
  "chevron-down",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "close",
  "eye",
  "eye-off",
  "star",
  "minus",
  "plus",
  "mail",
  "trash",
  "wallet",
  "activity",
  "tag",
  "download",
  "support",
  "logout",
  "image",
] as const;

export type IconName = (typeof iconNames)[number];

export const iconPath = (name: IconName) => `/icons/${name}.svg`;

export const imagesBase = "/images";

export const nftImages = {
  emerald: "/images/nfts/emerald-ape.jpg",
  sage: "/images/nfts/sage-nomad.jpg",
  neon: "/images/nfts/neon-vessel.jpg",
  golden: "/images/nfts/golden-beat.jpg",
} as const;

export const socialLoginIcons = {
  google: "/icons/google.svg",
  facebook: "/icons/facebook-color.svg",
} as const;
