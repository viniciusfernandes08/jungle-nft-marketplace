import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAnnounce } from "@/components/announcer-context";
import { useRegister } from "../hooks/use-auth-mutations";
import { safeRedirect } from "../redirect";
import { registerSchema, type RegisterValues } from "../schemas";
import { applyFieldErrors } from "./apply-api-errors";
import { PasswordField } from "./password-field";
import { TextField } from "./text-field";

export function RegisterForm({ redirectTo, submitLabel }: { redirectTo?: string; submitLabel: string }) {
  const router = useRouter();
  const announce = useAnnounce();
  const registration = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(({ fullName, email, password }) =>
    registration.mutate(
      { fullName, email, password },
      {
        onSuccess: (session) => {
          announce(`Conta criada. Você entrou como ${session.user.fullName}.`);
          router.history.push(safeRedirect(redirectTo));
        },
        onError: (error) => applyFieldErrors(error, setError, ["fullName", "email", "password"]),
      },
    ),
  );

  const banner = registration.error && !registration.error.fieldErrors ? registration.error.message : undefined;

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={registration.isPending} className="flex flex-col gap-3">
      <TextField label="Nome de usuário" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <TextField label="Digite seu e-mail" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <PasswordField label="Senha" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
      <PasswordField
        label="Confirmar senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {banner && (
        <p role="alert" className="text-small text-destructive">
          {banner}
        </p>
      )}
      <button
        type="submit"
        disabled={registration.isPending}
        className="mt-3 rounded-md bg-primary py-3.5 text-small font-bold text-primary-foreground disabled:opacity-60 lg:rounded-sm"
      >
        {registration.isPending ? "Criando..." : submitLabel}
      </button>
    </form>
  );
}
