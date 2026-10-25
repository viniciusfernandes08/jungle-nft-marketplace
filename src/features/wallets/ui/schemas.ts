import { z } from "zod";
import { networkIds } from "@/shared/domain/network";
import { isValidEnsName, isValidWalletAddress, walletProviderIds } from "../domain/wallet";

export const walletFormSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe o nome de exibição.").max(80),
    nickname: z.string().trim().min(1, "Informe o apelido da carteira.").max(40),
    profileName: z.string().trim().min(2, "Informe o nome do perfil.").max(80),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    address: z.string().trim().min(1, "Informe o endereço da carteira."),
    secondaryAddress: z.string().trim().max(120),
    ensName: z
      .string()
      .trim()
      .max(80)
      .refine((value) => value === "" || isValidEnsName(value), "Informe um ENS válido (ex.: nome.eth)."),
    referralCode: z.string().trim().max(40),
    network: z.enum(networkIds),
    provider: z.enum(walletProviderIds),
  })
  .superRefine((value, ctx) => {
    if (!isValidWalletAddress(value.network, value.address)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Endereço inválido para a rede selecionada.",
      });
    }
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

export type WalletFormValues = z.infer<typeof walletFormSchema>;
