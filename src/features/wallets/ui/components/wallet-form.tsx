import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { errorMessage } from "@/lib/error-message";
import { networkIds, networkLabels } from "@/shared/domain/network";
import { isDomainError } from "@/shared/domain/errors";
import {
  walletProviderIds,
  walletProviderLabels,
  type Wallet,
  type WalletInput,
  type WalletKind,
} from "../../domain/wallet";
import { useCreateWallet, useUpdateWallet } from "../hooks/use-wallets";
import { walletFormSchema, type WalletFormValues } from "../schemas";
import {
  AccountField,
  AccountSelect,
} from "@/features/profile/ui/components/account-fields";

const WALLET_FIELDS = [
  "displayName",
  "nickname",
  "profileName",
  "email",
  "address",
  "secondaryAddress",
  "ensName",
  "referralCode",
  "network",
  "provider",
] as const;

type FallbackProfile = {
  fullName: string;
  email: string;
};

type WalletFormProps = {
  wallet: Wallet | null;
  kind: WalletKind;
  fallback: FallbackProfile;
  /** Dados da principal usados quando "Igual à carteira principal" está marcado. */
  sameAsPrimary?: Wallet | null;
  onSaved: (wallet: Wallet) => void;
  onCancel?: () => void;
};

function defaultsFor(
  wallet: Wallet | null,
  kind: WalletKind,
  fallback: FallbackProfile,
  sameAsPrimary?: Wallet | null,
): WalletFormValues {
  const profileSource = sameAsPrimary ?? wallet;
  return {
    displayName: profileSource?.displayName ?? fallback.fullName,
    nickname: wallet?.nickname ?? wallet?.label ?? (kind === "primary" ? "Principal" : "Secundária"),
    profileName: profileSource?.profileName ?? profileSource?.displayName ?? fallback.fullName,
    email: profileSource?.email ?? fallback.email,
    address: wallet?.address ?? "",
    secondaryAddress: wallet?.secondaryAddress ?? "",
    ensName: wallet?.ensName ?? "",
    referralCode: wallet?.referralCode ?? "",
    network: wallet?.network ?? "ethereum",
    provider: wallet?.provider ?? "metamask",
  };
}

export function WalletForm({
  wallet,
  kind,
  fallback,
  sameAsPrimary,
  onSaved,
  onCancel,
}: WalletFormProps) {
  const formId = useId();
  const id = (field: string) => `${formId}-${field}`;
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const [formError, setFormError] = useState<string | null>(null);

  const lockedProfileFields = Boolean(sameAsPrimary) && !wallet;
  const pending = createWallet.isPending || updateWallet.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: defaultsFor(wallet, kind, fallback, sameAsPrimary),
    mode: "onTouched",
  });

  function applyServerErrors(error: unknown) {
    if (!isDomainError(error)) {
      setFormError(errorMessage(error));
      return;
    }

    let mapped = false;
    for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
      if (WALLET_FIELDS.includes(field as (typeof WALLET_FIELDS)[number])) {
        setError(field as keyof WalletFormValues, { type: "server", message });
        mapped = true;
      }
    }
    if (!mapped) setFormError(error.message);
  }

  async function onSubmit(values: WalletFormValues) {
    setFormError(null);
    const input: WalletInput = {
      kind,
      label: values.nickname,
      nickname: values.nickname,
      displayName: values.displayName,
      profileName: values.profileName,
      email: values.email,
      address: values.address,
      secondaryAddress: values.secondaryAddress || undefined,
      ensName: values.ensName || undefined,
      referralCode: values.referralCode || undefined,
      network: values.network,
      provider: values.provider,
    };

    try {
      const saved = wallet
        ? await updateWallet.mutateAsync({ id: wallet.id, input })
        : await createWallet.mutateAsync(input);
      onSaved(saved);
    } catch (error) {
      applyServerErrors(error);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={pending}>
      <div className="grid gap-x-[34px] gap-y-[30px] md:grid-cols-2">
        <AccountField
          id={id("display-name")}
          label="Nome de exibição"
          required
          readOnly={lockedProfileFields}
          dense
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <AccountField
          id={id("nickname")}
          label="Apelido da carteira"
          required
          dense
          error={errors.nickname?.message}
          {...register("nickname")}
        />
        <AccountSelect
          id={id("network")}
          label="Rede"
          required
          dense
          error={errors.network?.message}
          options={networkIds.map((network) => ({ value: network, label: networkLabels[network] }))}
          {...register("network")}
        />
        <AccountField
          id={id("profile-name")}
          label="Nome do perfil"
          required
          readOnly={lockedProfileFields}
          dense
          error={errors.profileName?.message}
          {...register("profileName")}
        />
        <AccountField
          id={id("address")}
          label="Endereço da carteira"
          required
          placeholder="0x..."
          dense
          error={errors.address?.message}
          {...register("address")}
        />
        <AccountField
          id={id("secondary-address")}
          label="ENS ou carteira secundária (opcional)"
          labelHidden
          placeholder="ENS ou carteira secundária (opcional)"
          dense
          error={errors.secondaryAddress?.message}
          {...register("secondaryAddress")}
        />
        <AccountSelect
          id={id("provider")}
          label="Tipo de carteira"
          required
          dense
          error={errors.provider?.message}
          options={walletProviderIds.map((provider) => ({
            value: provider,
            label: walletProviderLabels[provider],
          }))}
          {...register("provider")}
        />
        <AccountField
          id={id("referral")}
          label="Código de indicação"
          dense
          error={errors.referralCode?.message}
          {...register("referralCode")}
        />
        <AccountField
          id={id("email")}
          label="E-mail"
          required
          type="email"
          readOnly={lockedProfileFields}
          dense
          error={errors.email?.message}
          {...register("email")}
        />
        <AccountField
          id={id("ens-name")}
          label="Nome ENS"
          placeholder="nome.eth (opcional)"
          dense
          error={errors.ensName?.message}
          {...register("ensName")}
        />
      </div>

      {formError && (
        <p role="alert" className="mt-6 text-small text-destructive">
          {formError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-[6px] bg-primary px-6 text-small font-bold text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-60"
        >
          {pending
            ? "Salvando..."
            : wallet
              ? "Salvar carteira"
              : "Adicionar carteira"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-small text-muted-foreground transition-colors hover:text-primary disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
