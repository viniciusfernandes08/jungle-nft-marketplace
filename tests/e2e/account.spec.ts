import { expect, test, type Page } from "@playwright/test";
import { signIn } from "./support/checkout";

const AVATAR_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

async function signInAs(page: Page, email: string, password: string) {
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar" }).first().click();
  await page.getByPlaceholder("contato@email.com").fill(email);
  await page.getByPlaceholder("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test.describe("conta desktop", () => {
  test.use({ viewport: { width: 1440, height: 1080 } });

  test("atualiza o perfil, a senha e o avatar com persistência", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();

    const form = page.locator("form").first();
    await expect(page.locator("#profile-display-name")).toHaveValue("Ana Souza");
    await expect(page.locator("#profile-wallet-nickname")).toHaveValue("Principal");

    await page.locator("#profile-display-name").fill("Ana Souza Teste");
    await page.locator("#profile-wallet-nickname").fill("Principal Teste");
    await form.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(form.getByText("Perfil atualizado com sucesso.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir meu perfil" })).toContainText(
      "Ana Souza Teste",
    );

    await page.reload();
    await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();
    await expect(page.locator("#profile-display-name")).toHaveValue("Ana Souza Teste");
    await expect(page.locator("#profile-wallet-nickname")).toHaveValue("Principal Teste");

    // A senha só é alterada quando o bloco é preenchido.
    await page.locator("#profile-current-password").fill("SenhaErrada@1");
    await page.locator("#profile-new-password").fill("NovaSenha@456");
    await page.locator("#profile-confirm-password").fill("NovaSenha@456");
    await form.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(form.getByText("A senha atual está incorreta.")).toBeVisible();

    await page.locator("#profile-current-password").fill("Kurio@123");
    await form.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(form.getByText("Perfil e senha atualizados com sucesso.")).toBeVisible();
    await expect(page.locator("#profile-current-password")).toHaveValue("");
    await expect(page.locator("#profile-new-password")).toHaveValue("");
    await expect(page.locator("#profile-confirm-password")).toHaveValue("");

    await form.locator('input[type="file"]').setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: AVATAR_PNG,
    });
    await expect(form.getByText("Avatar atualizado com sucesso.")).toBeVisible();
    await expect(page.locator('img[alt^="Avatar de"]')).toHaveCount(1);

    await form.getByRole("button", { name: "Remover", exact: true }).click();
    await expect(form.getByText("Avatar removido.")).toBeVisible();
    await expect(page.locator('img[alt^="Avatar de"]')).toHaveCount(0);

    // E-mail de outra conta: o erro fica no campo, sem perder os demais dados.
    await page.locator("#profile-email").fill("bruno@kurio.test");
    await form.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(form.getByText("Este e-mail já está cadastrado.")).toBeVisible();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("edita a carteira principal e cria/edita uma secundária", async ({ page }) => {
    await signIn(page);
    await page.goto("/wallets");
    await expect(page.getByRole("heading", { name: "Carteira Principal" })).toBeVisible();

    const primaryForm = page.locator("form").nth(0);
    await expect(primaryForm.locator('input[name="nickname"]')).toHaveValue("Principal");
    await primaryForm.locator('input[name="nickname"]').fill("Principal Ana");
    await primaryForm.getByRole("button", { name: "Salvar carteira" }).click();
    await expect(page.getByText("Carteira principal atualizada com sucesso.").first()).toBeVisible();

    await page.goto("/profile");
    await expect(page.locator("#profile-wallet-nickname")).toHaveValue("Principal Ana");

    await page.goto("/wallets");
    await expect(page.getByRole("heading", { name: "Carteira Principal" })).toBeVisible();

    await page.getByRole("button", { name: "Adicionar", exact: true }).last().click();
    await page.getByLabel("Igual à carteira principal").check();
    const secondaryForm = page.locator("form").nth(1);
    await expect(secondaryForm.locator('input[name="displayName"]')).toHaveValue("Ana Souza");
    await expect(secondaryForm.locator('input[name="profileName"]')).toHaveValue("Ana Souza");
    await expect(secondaryForm.locator('input[name="email"]')).toHaveValue("ana@kurio.test");
    await expect(secondaryForm.locator('input[name="displayName"]')).not.toBeEditable();
    await expect(secondaryForm.locator('input[name="profileName"]')).not.toBeEditable();
    await expect(secondaryForm.locator('input[name="email"]')).not.toBeEditable();

    await secondaryForm.locator('input[name="nickname"]').fill("Secundária teste");
    await secondaryForm.locator('input[name="address"]').fill(`0x${"1".repeat(40)}`);
    await secondaryForm.getByRole("button", { name: "Adicionar carteira" }).click();
    await expect(page.getByText("Carteira secundária salva com sucesso.").first()).toBeVisible();
    await expect(page.getByText("Secundária teste", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Editar" }).last().click();
    const editForm = page.locator("form").nth(1);
    await editForm.locator('input[name="nickname"]').fill("Secundária editada");
    await editForm.getByRole("button", { name: "Salvar carteira" }).click();
    await expect(page.getByText("Carteira secundária salva com sucesso.").first()).toBeVisible();
    await expect(page.getByText("Secundária editada", { exact: true })).toBeVisible();
  });

  test("mostra o estado vazio de carteira secundária para outra conta", async ({ page }) => {
    await signInAs(page, "bruno@kurio.test", "Kurio@123");
    await page.goto("/wallets");
    await expect(page.getByRole("heading", { name: "Carteira Principal" })).toBeVisible();
    await expect(page.getByText("Você ainda não adicionou uma carteira secundária.")).toBeVisible();

    await page.getByRole("button", { name: "Adicionar", exact: true }).last().click();
    await expect(page.getByText("Você ainda não adicionou uma carteira secundária.")).toBeHidden();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByText("Você ainda não adicionou uma carteira secundária.")).toBeVisible();
  });

  test("protege as rotas da conta e volta para a tela pedida após o login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe("/profile");

    await page.goto("/wallets");
    await expect(page).toHaveURL(/\/login\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe("/wallets");
  });
});

test.describe("conta mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("navega entre perfil e carteiras sem overflow horizontal", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Perfil do colecionador" })).toBeVisible();
    const accountNav = page.getByRole("navigation", { name: "Menu da conta" });
    await expect(accountNav).toBeVisible();

    let width = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(width.scrollWidth).toBeLessThanOrEqual(width.innerWidth + 1);

    await accountNav.getByRole("link", { name: "Carteiras" }).click();
    await expect(page).toHaveURL(/\/wallets$/);
    await expect(page.getByRole("heading", { name: "Carteira Principal" })).toBeVisible();

    width = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(width.scrollWidth).toBeLessThanOrEqual(width.innerWidth + 1);
  });

  test("destaca a rota atual e usa #CFB28C nos demais ícones do mobile nav", async ({ page }) => {
    await signIn(page);

    const nav = page.getByRole("navigation", { name: "Navegação móvel" });
    const home = nav.getByRole("link", { name: "Início" });
    const cart = nav.getByRole("link", { name: /^Carrinho/ });
    const profile = nav.getByRole("link", { name: "Meu perfil" });
    const favorites = nav.getByRole("button", { name: "Favoritos" });

    await expect(home).toHaveCSS("color", "rgb(210, 138, 76)");
    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(cart).toHaveCSS("color", "rgb(207, 178, 140)");
    await expect(profile).toHaveCSS("color", "rgb(207, 178, 140)");
    await expect(favorites).toHaveCSS("color", "rgb(207, 178, 140)");

    await profile.click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(profile).toHaveCSS("color", "rgb(210, 138, 76)");
    await expect(profile).toHaveAttribute("aria-current", "page");
    await expect(home).toHaveCSS("color", "rgb(207, 178, 140)");
  });
});
