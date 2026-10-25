import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useAnnounce } from "@/components/announcer-context";
import { Icon } from "@/components/icon";
import { useSession } from "@/features/auth/ui/hooks/use-session";
import { errorMessage } from "@/lib/error-message";
import { isDomainError } from "@/shared/domain/errors";
import type { Profile } from "../domain/profile";
import { useChangePassword, useProfile, useUpdateAvatar, useUpdateProfile } from "./hooks/use-profile";
import { profileSchema, type ProfileFormValues } from "./schemas";
import { AccountField, AccountPasswordField } from "./components/account-fields";
import { AccountShell } from "./components/account-sidebar";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PROFILE_FIELDS = [
  "displayName",
  "username",
  "email",
  "ensName",
  "walletNickname",
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function ProfileSkeleton() {
  return (
    <AccountShell>
      <div aria-busy="true" aria-label="Carregando perfil" className="space-y-8">
        <div className="skeleton h-5 w-52 rounded-[4px]" />
        <div className="grid gap-x-[34px] gap-y-8 md:grid-cols-2">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
        <div className="skeleton h-40" />
      </div>
    </AccountShell>
  );
}

function ProfileEditor({ profile }: { profile: Profile }) {
  const announce = useAnnounce();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const changePassword = useChangePassword();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [avatarState, setAvatarState] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      ensName: profile.ensName,
      walletNickname: profile.walletNickname,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  function applyServerErrors(error: unknown) {
    if (!isDomainError(error)) {
      setStatus({ type: "error", message: errorMessage(error) });
      return;
    }

    const fieldErrors = error.fieldErrors ?? {};
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (PROFILE_FIELDS.includes(field as (typeof PROFILE_FIELDS)[number])) {
        setError(field as keyof ProfileFormValues, { type: "server", message });
        mapped = true;
      }
    }

    if (!mapped) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile.mutateAsync({
        displayName: values.displayName,
        username: values.username,
        email: values.email,
        ensName: values.ensName,
        walletNickname: values.walletNickname,
      });

      const changingPassword = Boolean(values.currentPassword);
      if (changingPassword) {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        setValue("currentPassword", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
      }

      const message = changingPassword
        ? "Perfil e senha atualizados com sucesso."
        : "Perfil atualizado com sucesso.";
      setStatus({ type: "success", message });
      announce(message);
    } catch (error) {
      applyServerErrors(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarState(null);

    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      setAvatarState({ type: "error", message: "Use uma imagem PNG, JPEG ou WebP." });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarState({ type: "error", message: "A imagem deve ter no máximo 2 MB." });
      return;
    }

    try {
      const avatarDataUrl = await fileToDataUrl(file);
      await updateAvatar.mutateAsync(avatarDataUrl);
      const message = "Avatar atualizado com sucesso.";
      setAvatarState({ type: "success", message });
      announce(message);
    } catch (error) {
      setAvatarState({ type: "error", message: errorMessage(error) });
    }
  }

  async function handleRemoveAvatar() {
    setAvatarState(null);
    try {
      await updateAvatar.mutateAsync(null);
      const message = "Avatar removido.";
      setAvatarState({ type: "success", message });
      announce(message);
    } catch (error) {
      setAvatarState({ type: "error", message: errorMessage(error) });
    }
  }

  return (
    <section aria-labelledby="profile-title">
      <h1 id="profile-title" className="text-body font-bold">
        Perfil do colecionador
      </h1>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={saving}
        className="mt-7"
      >
        <div className="grid gap-x-[34px] gap-y-[30px] md:grid-cols-2">
          <AccountField
            id="profile-display-name"
            label="Nome de exibição"
            required
            error={errors.displayName?.message}
            autoComplete="name"
            {...register("displayName")}
          />
          <AccountField
            id="profile-username"
            label="Nome de usuário"
            required
            error={errors.username?.message}
            autoComplete="username"
            {...register("username")}
          />
          <AccountField
            id="profile-email"
            label="E-mail"
            required
            type="email"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />
          <AccountField
            id="profile-ens"
            label="Nome ENS"
            placeholder="nome.eth (opcional)"
            error={errors.ensName?.message}
            {...register("ensName")}
          />
          <AccountField
            id="profile-wallet-nickname"
            label="Apelido da carteira"
            required
            error={errors.walletNickname?.message}
            {...register("walletNickname")}
          />

          <div className="-mt-2 flex min-w-0 flex-col gap-2.5">
            <span className="text-small leading-tight">Avatar</span>
            <div className="flex min-h-12 flex-wrap items-center gap-3 pl-2">
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`Avatar de ${profile.displayName}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <Icon name="image" className="size-5 text-primary" />
                )}
              </span>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void handleAvatarSelection(event)}
              />
              <button
                type="button"
                disabled={updateAvatar.isPending}
                onClick={() => avatarInputRef.current?.click()}
                className="h-10 rounded-[6px] bg-primary px-5 text-small font-bold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-60"
              >
                {updateAvatar.isPending ? "Atualizando..." : "Alterar"}
              </button>
              <button
                type="button"
                disabled={!profile.avatarUrl || updateAvatar.isPending}
                onClick={() => void handleRemoveAvatar()}
                className="ml-2 text-small text-foreground/75 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remover
              </button>
            </div>
            {avatarState && (
              <p
                role={avatarState.type === "error" ? "alert" : "status"}
                className={
                  avatarState.type === "error"
                    ? "text-micro text-destructive"
                    : "text-micro text-primary"
                }
              >
                {avatarState.message}
              </p>
            )}
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-body font-bold">Alterar senha</h2>
          <div className="mt-4 grid max-w-[411px] gap-[22px]">
            <AccountPasswordField
              id="profile-current-password"
              label="Senha atual"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <AccountPasswordField
              id="profile-new-password"
              label="Nova senha"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <AccountPasswordField
              id="profile-confirm-password"
              label="Confirmar nova senha"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        </section>

        {status && (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={
              status.type === "error"
                ? "mt-6 text-small text-destructive"
                : "mt-6 text-small text-primary"
            }
          >
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 h-10 rounded-[6px] bg-primary px-10 text-small font-bold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </section>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <AccountShell>
      <section role="alert" className="bg-card p-8 text-center">
        <h1 className="text-body font-bold">Não foi possível carregar seu perfil</h1>
        <p className="mt-2 text-small text-muted-foreground">
          Verifique a conexão e tente novamente.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 h-10 rounded-[6px] bg-primary px-6 text-small font-bold text-primary-foreground"
        >
          Tentar novamente
        </button>
      </section>
    </AccountShell>
  );
}

export function ProfilePage() {
  const profileQuery = useProfile();
  const { data: session } = useSession();

  if (!session) return null;
  if (profileQuery.isPending) return <ProfileSkeleton />;
  if (profileQuery.isError || !profileQuery.data) {
    return <ProfileError onRetry={() => void profileQuery.refetch()} />;
  }

  return (
    <AccountShell>
      <ProfileEditor profile={profileQuery.data} />
    </AccountShell>
  );
}
