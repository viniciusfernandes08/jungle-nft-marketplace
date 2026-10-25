import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAnnounce } from "@/components/announcer-context";
import { UnavailableLink } from "@/components/unavailable-link";
import { useLogin } from "../hooks/use-auth-mutations";
import { safeRedirect } from "../redirect";
import { loginSchema, type LoginValues } from "../schemas";
import { applyFieldErrors } from "./apply-api-errors";
import { PasswordField } from "./password-field";
import { TextField } from "./text-field";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const announce = useAnnounce();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: (session) => {
        announce(`Você entrou como ${session.user.fullName}.`);
        router.history.push(safeRedirect(redirectTo));
      },
      onError: (error) => applyFieldErrors(error, setError, ["email", "password"]),
    }),
  );

  const banner = login.error && !login.error.fieldErrors ? login.error.message : undefined;

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={login.isPending} className="flex flex-col gap-3">
      <TextField
        label="contato@email.com"
        type="email"
        autoComplete="username"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Senha"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <UnavailableLink
        message="A recuperação de senha não está disponível nesta versão."
        className="self-end text-small text-primary"
      >
        Esqueceu a senha?
      </UnavailableLink>
      {banner && (
        <p role="alert" className="text-small text-destructive">
          {banner}
        </p>
      )}
      <button
        type="submit"
        disabled={login.isPending}
        className="mt-3 rounded-md bg-primary py-3.5 text-small font-bold text-primary-foreground disabled:opacity-60 lg:rounded-sm"
      >
        {login.isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
