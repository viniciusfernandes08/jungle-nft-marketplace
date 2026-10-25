import type { Page } from "@playwright/test";

export const CART_ITEMS = [
  { name: "Emerald Ape #042", quantity: 2 },
  { name: "Violet Nomad #314", quantity: 6 },
  { name: "Ivory Baron #088", quantity: 9 },
] as const;

/** Entra com a conta de teste. Funciona no header desktop e na bottom nav mobile. */
export async function signIn(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar" }).first().click();
  await page.getByPlaceholder("contato@email.com").fill("ana@kurio.test");
  await page.getByPlaceholder("Senha").fill("Kurio@123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

/** Semeia o carrinho do print (2/6/9) via API mockada, usando o token da sessão. */
export async function seedCart(page: Page) {
  await page.evaluate(async (items) => {
    const token = localStorage.getItem("kurio:auth-token");
    if (!token) throw new Error("Sessão ausente ao semear o carrinho.");

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const response = await fetch("/api/nfts?page=1&perPage=40");
    if (!response.ok) throw new Error(`Falha ao carregar NFTs: ${response.status}`);
    const payload = await response.json();
    const nfts = payload.items ?? payload;

    for (const item of items) {
      const nft = nfts.find((candidate: { name: string }) => candidate.name === item.name);
      const edition = nft?.editions.find(
        (candidate: { available: number }) => candidate.available >= item.quantity,
      );
      if (!nft || !edition) throw new Error(`Sem estoque para ${item.name}`);

      const added = await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId: nft.id, editionId: edition.id, quantity: item.quantity }),
      });
      if (!added.ok) throw new Error(`Falha ao adicionar ${item.name}: ${added.status}`);
    }
  }, CART_ITEMS);
}

/** Abre o checkout com dados frescos (a navegação recarrega o app). */
export async function openCheckout(page: Page) {
  await page.goto("/checkout");
  await page
    .getByRole("heading", { name: /Perfil do colecionador|Pagamento com carteira/ })
    .waitFor({ timeout: 15_000 });
}

/** Espera o provedor padrão terminar de conectar. */
export async function waitForWalletConnected(page: Page) {
  await page
    .getByRole("status")
    .filter({ hasText: "Carteira conectada" })
    .waitFor({ timeout: 15_000 });
}

export async function chooseFirstWallet(page: Page) {
  const value = await page
    .locator("#wallet-id option")
    .evaluateAll((options) =>
      options.find((option) => !option.disabled && option.value)?.value,
    );
  if (!value) throw new Error("Nenhuma carteira disponível para a rede.");
  await page.selectOption("#wallet-id", value);
}
