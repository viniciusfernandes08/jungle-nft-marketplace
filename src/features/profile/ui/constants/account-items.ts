import type { IconName } from "@/config/assets";

type AccountItem = {
  label: string;
  icon: IconName;
  to?: "/profile" | "/wallets";
};

export const ACCOUNT_ITEMS: AccountItem[] = [
  { label: "Dados do perfil", icon: "user", to: "/profile" },
  { label: "Carteiras", icon: "wallet", to: "/wallets" },
  { label: "Atividade", icon: "cart" },
  { label: "Lista de interesse", icon: "heart-filled" },
  { label: "Ofertas", icon: "tag" },
  { label: "Arquivos baixados", icon: "download" },
  { label: "Suporte", icon: "support" },
];