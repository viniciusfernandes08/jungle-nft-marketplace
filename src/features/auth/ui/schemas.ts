import { z } from "zod";

const email = z.string().trim().pipe(z.email("Informe um e-mail válido."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome de usuário (mínimo 3 caracteres)."),
    email,
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .regex(/[A-Za-z]/, "A senha deve ter ao menos uma letra.")
      .regex(/\d/, "A senha deve ter ao menos um número."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
