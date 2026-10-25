import { z } from "zod";
import { isValidEnsName } from "@/features/wallets/domain/wallet";

export const profileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe o nome de exibição.").max(60),
    username: z
      .string()
      .trim()
      .min(3, "O nome de usuário deve ter ao menos 3 caracteres.")
      .max(30, "O nome de usuário deve ter no máximo 30 caracteres.")
      .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e sublinhado."),
    email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
    ensName: z
      .string()
      .trim()
      .max(80)
      .refine((value) => value === "" || isValidEnsName(value), "Informe um ENS válido (ex.: nome.eth)."),
    walletNickname: z.string().trim().min(1, "Informe um apelido para a carteira.").max(40),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((value, ctx) => {
    const changingPassword = Boolean(value.currentPassword || value.newPassword || value.confirmPassword);
    if (!changingPassword) return;

    if (!value.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Informe sua senha atual.",
      });
    }
    if (value.newPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter ao menos 8 caracteres.",
      });
    }
    if (!/[A-Za-z]/.test(value.newPassword)) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter ao menos uma letra.",
      });
    }
    if (!/\d/.test(value.newPassword)) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter ao menos um número.",
      });
    }
    if (!/[^A-Za-z0-9]/.test(value.newPassword)) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ter ao menos um símbolo.",
      });
    }
    if (value.currentPassword && value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ser diferente da atual.",
      });
    }
    if (value.confirmPassword !== value.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não conferem.",
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
