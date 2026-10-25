import { expect, test } from "@playwright/test";
import {
  openCheckout,
  seedCart,
  signIn,
  waitForWalletConnected,
} from "./support/checkout";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("checkout mobile", () => {
  test("mostra só a carteira, troca de carteira e confirma em tela cheia", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await openCheckout(page);
    await waitForWalletConnected(page);

    await expect(page.getByRole("heading", { name: "Pagamento com carteira" })).toBeVisible();
    await expect(page.getByText("Perfil do colecionador")).toHaveCount(0);
    await expect(page.getByRole("radio", { name: /Reserva/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByRole("radio", { name: "Coinbase Wallet" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByText("26.834 ETH", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Trocar carteira" }).click();
    await expect(page.getByText("26.846 ETH", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("radio", { name: /Principal/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByRole("radio", { name: "MetaMask" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await waitForWalletConnected(page);

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\?order=/);
    const receipt = page.getByRole("dialog");
    await expect(
      receipt.getByRole("heading", { name: "Seus NFTs agora estão na sua carteira" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(receipt).toContainText("26.846 ETH");
    await expect(receipt.getByRole("link", { name: "Ver no Etherscan" })).toBeVisible();

    const box = await receipt.boundingBox();
    expect(box?.x).toBe(0);
    expect(box?.width).toBe(390);
  });

  test("recusa a conexão e permite tentar novamente", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await page.evaluate(() => {
      (
        window as unknown as { kurioMocks: { setScenario: (name: string) => void } }
      ).kurioMocks.setScenario("wallet-refused");
    });
    await openCheckout(page);

    await expect(page.getByText(/A conexão foi recusada na carteira/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeDisabled();

    await page.evaluate(() => {
      (
        window as unknown as { kurioMocks: { setScenario: (name: string) => void } }
      ).kurioMocks.setScenario("default");
    });
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await waitForWalletConnected(page);
    await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();
  });

  test("pedido recusado explica o motivo e mantém o carrinho", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await page.evaluate(() => {
      (
        window as unknown as { kurioMocks: { setScenario: (name: string) => void } }
      ).kurioMocks.setScenario("order-declined");
    });
    await openCheckout(page);
    await waitForWalletConnected(page);

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\?order=/);
    const receipt = page.getByRole("dialog");
    await expect(
      receipt.getByRole("heading", { name: "A compra não foi concluída" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(receipt).toContainText("A carteira recusou a transação.");
    await expect(receipt.getByRole("link", { name: /Ver no/ })).toHaveCount(0);

    await receipt.getByRole("button", { name: "Voltar ao carrinho" }).click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText("Emerald Ape #042")).toBeVisible();
  });

  test("pedido pendente continua consultando e volta pendente após refresh", async ({ page }) => {
    await signIn(page);
    await seedCart(page);
    await page.evaluate(() => {
      (
        window as unknown as { kurioMocks: { setScenario: (name: string) => void } }
      ).kurioMocks.setScenario("order-pending");
    });
    await openCheckout(page);
    await waitForWalletConnected(page);

    await page.getByRole("button", { name: "Confirmar compra" }).click();
    await expect(page).toHaveURL(/\/checkout\?order=/);
    await expect(
      page.getByRole("heading", { name: "Estamos confirmando sua transação" }),
    ).toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(2_500);
    await expect(
      page.getByRole("heading", { name: "Estamos confirmando sua transação" }),
    ).toBeVisible();

    const orderUrl = page.url();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Estamos confirmando sua transação" }),
    ).toBeVisible({ timeout: 15_000 });
    expect(page.url()).toBe(orderUrl);
  });
});
