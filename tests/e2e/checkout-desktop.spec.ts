import { expect, test } from "@playwright/test";
import {
  chooseFirstWallet,
  openCheckout,
  seedCart,
  signIn,
  waitForWalletConnected,
} from "./support/checkout";

test.describe("checkout desktop", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("preenche o perfil, cria o pedido e restaura a confirmação no refresh", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await openCheckout(page);
    await waitForWalletConnected(page);

    await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeDisabled();
    await chooseFirstWallet(page);
    await page.getByLabel(/Código de indicação/).fill("KURIO10");
    await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\?order=/);

    const receipt = page.getByRole("dialog");
    await expect(
      receipt.getByRole("heading", { name: "Seus NFTs agora estão na sua carteira" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(receipt).toContainText("26.846 ETH");
    await expect(receipt).toContainText("0.016 ETH");
    await expect(receipt).toContainText("Emerald Ape #042");
    await expect(receipt.getByRole("link", { name: "Ver no Etherscan" })).toHaveAttribute(
      "href",
      /^https:\/\/etherscan\.io\/tx\/0xa91f/,
    );

    const orderUrl = page.url();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Seus NFTs agora estão na sua carteira" }),
    ).toBeVisible({ timeout: 15_000 });
    expect(page.url()).toBe(orderUrl);
    await expect(page.getByRole("dialog")).toContainText("26.846 ETH");
  });

  test("revalida o preço e exige aceitar o novo total antes de comprar", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await openCheckout(page);
    await waitForWalletConnected(page);

    await chooseFirstWallet(page);
    await page.getByLabel(/Código de indicação/).fill("KURIO10");
    await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();

    await page.evaluate(async () => {
      const controls = (
        window as unknown as { kurioMocks: { increasePrice: () => Promise<string | undefined> } }
      ).kurioMocks;
      await controls.increasePrice();
    });

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Os valores do pedido mudaram" })).toBeVisible();
    await expect(dialog).toContainText("26.846 ETH");
    await expect(dialog).toContainText("27.046 ETH");

    await dialog.getByRole("button", { name: "Aceitar e confirmar" }).click();
    await expect(page).toHaveURL(/\/checkout\?order=/);
    const receipt = page.getByRole("dialog");
    await expect(
      receipt.getByRole("heading", { name: "Seus NFTs agora estão na sua carteira" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(receipt).toContainText("27.046 ETH");
    await expect(receipt).toContainText("2.58 ETH");
  });
});
