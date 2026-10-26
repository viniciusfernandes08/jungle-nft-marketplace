import { z } from "zod";
import { isValidEnsName, isValidWalletAddress, walletProviderIds } from "@/features/wallets/domain/wallet";
import { networkIds } from "@/shared/domain/network";

const email = z.string().trim().pipe(z.email("Informe um e-mail válido."));

const ensLabel = z
  .string()
  .trim()
  .min(2, "Informe um nome ENS com ao menos 2 caracteres.")
  .max(60)
  .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/i, "Use letras, números, ponto ou hífen.");

export const checkoutSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe o nome de exibição.").max(80),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres.")
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou sublinhado."),
    network: z.enum(networkIds),
    profileName: z.string().trim().min(2, "Informe o nome do perfil.").max(80),
    walletId: z.string().min(1, "Selecione a carteira."),
    secondaryAddress: z.string().trim().max(120).optional(),
    walletType: z.enum(walletProviderIds),
    referralCode: z.string().trim().min(2, "Informe o código de indicação.").max(40),
    email,
    ensLabel,
    note: z.string().trim().max(500, "A observação deve ter no máximo 500 caracteres.").optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.secondaryAddress &&
      !isValidEnsName(value.secondaryAddress) &&
      !isValidWalletAddress(value.network, value.secondaryAddress)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["secondaryAddress"],
        message: "Informe um ENS (.eth) ou um endereço válido para a rede.",
      });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
