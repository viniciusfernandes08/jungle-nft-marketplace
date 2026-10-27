import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAnnounce } from "@/components/announcer-context";
import type { Quote } from "@/features/cart/domain/quote";
import type { Session } from "@/features/auth/domain/session";
import type { Collector } from "@/features/orders/domain/order";
import {
  walletProviderLabels,
  walletDisplayName,
  type Wallet,
  type WalletProviderId,
} from "@/features/wallets/domain/wallet";
import type { WalletConnectionState } from "@/features/wallets/ui/hooks/use-wallet-connection";
import { networkIds, networkLabels, type NetworkId } from "@/shared/domain/network";
import { isDomainError } from "@/shared/domain/errors";
import { errorMessage } from "@/lib/error-message";
import { checkoutSchema, type CheckoutFormValues } from "../schemas";
import { sanitizeEnsLabel, sanitizeUsername } from "../format";
import { CheckoutSummary } from "./checkout-summary";
import { SelectField, TextAreaField, TextField, type SelectOption } from "./field";
import { ProviderList } from "./provider-list";
import { providerOrder } from "../provider-order";
import { FORM_FIELDS } from "../constants/form-fields";

export type SubmitOrderResult = "created" | "review";
export type SubmitOrder = (collector: Collector, walletId: string) => Promise<SubmitOrderResult>;

type Props = {
  session: Session;
  wallets: Wallet[];
  quote: Quote | undefined;
  quoteError: unknown;
  quoteRefreshing: boolean;
  quoteReady: boolean;
  quoteBanner: string | undefined;
  onRetryQuote: () => void;
  provider: WalletProviderId;
  connection: WalletConnectionState;
  onSelectWallet: (wallet: Wallet) => void;
  onNetworkChange: (network: NetworkId) => void;
  onProviderChange: (provider: WalletProviderId) => void;
  onRetryConnection: () => void;
  onDisconnect: () => void;
  submitOrder: SubmitOrder;
};

function formFieldFor(path: string): keyof CheckoutFormValues | undefined {
  const field = path.replace(/^collector\./, "");
  const mapped =
    field === "walletAddress" ? "walletId" : field === "ensName" ? "ensLabel" : field;
  return (FORM_FIELDS as readonly string[]).includes(mapped)
    ? (mapped as keyof CheckoutFormValues)
    : undefined;
}

export function DesktopCheckout({
  session,
  wallets,
  quote,
  quoteError,
  quoteRefreshing,
  quoteReady,
  quoteBanner,
  onRetryQuote,
  provider,
  connection,
  onSelectWallet,
  onNetworkChange,
  onProviderChange,
  onRetryConnection,
  onDisconnect,
  submitOrder,
}: Props) {
  const announce = useAnnounce();
  const [apiError, setApiError] = useState<string>();

  const emailPrefix = session.user.email.split("@")[0] ?? "colecionador";
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      displayName: session.user.fullName,
      username: sanitizeUsername(emailPrefix),
      network: "ethereum",
      profileName: session.user.fullName,
      walletId: "",
      secondaryAddress: "",
      walletType: provider,
      referralCode: "",
      email: session.user.email,
      ensLabel: sanitizeEnsLabel(emailPrefix),
      note: "",
    },
  });

  const network = useWatch({ control, name: "network" });
  const walletId = useWatch({ control, name: "walletId" });
  const walletType = useWatch({ control, name: "walletType" });

  useEffect(() => {
    if (walletType !== provider) setValue("walletType", provider, { shouldValidate: true });
  }, [provider, walletType, setValue]);

  const networkWallets = wallets.filter((wallet) => wallet.network === network);
  const addressOptions: SelectOption[] = networkWallets.map((wallet) => ({
    value: wallet.id,
    label: `${wallet.label} — ${walletDisplayName(wallet)}`,
  }));

  const networkOptions: SelectOption[] = networkIds.map((id) => ({
    value: id,
    label: networkLabels[id],
  }));

  const typeOptions: SelectOption[] = providerOrder.map((id) => ({
    value: id,
    label: walletProviderLabels[id],
  }));

  const activeConnection =
    connection.status !== "idle" && connection.providerId === provider
      ? connection
      : ({ status: "idle" } as const);
  const connected = activeConnection.status === "connected";

  const canSubmit =
    Boolean(quote) &&
    Boolean(quote && quote.issues.length === 0) &&
    !quoteError &&
    quoteReady &&
    connected &&
    isValid &&
    !isSubmitting;

  function handleNetworkChange(value: string) {
    const next = value as NetworkId;
    setValue("network", next, { shouldValidate: true });
    const selected = wallets.find((wallet) => wallet.id === walletId);
    if (selected && selected.network !== next) {
      setValue("walletId", "", { shouldValidate: false });
    }
    onNetworkChange(next);
  }

  function handleWalletChange(value: string) {
    const wallet = wallets.find((candidate) => candidate.id === value);
    if (!wallet) return;
    setValue("walletId", wallet.id, { shouldValidate: true });
    setValue("network", wallet.network, { shouldValidate: true });
    if (wallet.provider) setValue("walletType", wallet.provider, { shouldValidate: true });
    onSelectWallet(wallet);
  }

  function handleProviderChange(next: WalletProviderId) {
    setValue("walletType", next, { shouldValidate: true });
    onProviderChange(next);
  }

  const onSubmit = handleSubmit(async (values) => {
    setApiError(undefined);
    const wallet = wallets.find((candidate) => candidate.id === values.walletId);
    if (!wallet) {
      setError("walletId", { type: "manual", message: "Selecione a carteira." });
      return;
    }
    if (wallet.network !== values.network) {
      setError("network", { type: "manual", message: "A rede não corresponde à carteira." });
      return;
    }
    if (!connected) {
      setApiError("Conecte a carteira para continuar.");
      return;
    }

    const collector: Collector = {
      displayName: values.displayName.trim(),
      username: values.username.trim(),
      profileName: values.profileName.trim(),
      email: values.email.trim(),
      ensName: `${values.ensLabel.trim().toLowerCase()}.eth`,
      network: wallet.network,
      walletAddress: wallet.address,
      walletType: provider,
      referralCode: values.referralCode.trim() || undefined,
      secondaryAddress: values.secondaryAddress?.trim() || undefined,
      useAnotherWallet: false,
      note: values.note?.trim() || undefined,
    };

    try {
      await submitOrder(collector, wallet.id);
    } catch (error) {
      if (isDomainError(error)) {
        let mapped = false;
        for (const [path, message] of Object.entries(error.fieldErrors ?? {})) {
          const field = formFieldFor(path);
          if (!field) continue;
          setError(field, { type: "server", message });
          mapped = true;
        }
        if (!mapped) setApiError(errorMessage(error));
        return;
      }
      setApiError(errorMessage(error));
    }
  });

  return (
    <form
      id="checkout-form"
      noValidate
      onSubmit={onSubmit}
      aria-busy={isSubmitting}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_332px] lg:items-start lg:gap-14"
    >
      <section aria-labelledby="collector-title" className="min-w-0">
        <h2 id="collector-title" className="text-body font-bold">
          Perfil do colecionador
        </h2>

        {quoteBanner && (
          <p role="status" className="mt-3 rounded-md bg-secondary px-3 py-2 text-small text-primary">
            {quoteBanner}
          </p>
        )}
        {apiError && (
          <p role="alert" className="mt-3 rounded-md bg-secondary px-3 py-2 text-small text-destructive">
            {apiError}
          </p>
        )}

        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <TextField
            id="display-name"
            label="Nome de exibição"
            required
            autoComplete="name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <TextField
            id="username"
            label="Nome de usuário"
            required
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />

          <SelectField
            id="network"
            label="Rede"
            required
            value={network}
            onChange={handleNetworkChange}
            options={networkOptions}
            error={errors.network?.message}
          />
          <TextField
            id="profile-name"
            label="Nome do perfil"
            required
            autoComplete="nickname"
            error={errors.profileName?.message}
            {...register("profileName")}
          />

          <SelectField
            id="wallet-id"
            label="Endereço da carteira"
            required
            value={walletId}
            onChange={handleWalletChange}
            options={addressOptions}
            placeholder="Endereço 0x da carteira"
            hint={
              networkWallets.length === 0
                ? "Nenhuma carteira cadastrada nesta rede."
                : undefined
            }
            error={errors.walletId?.message}
          />
          <TextField
            id="secondary-address"
            label="ENS ou carteira secundária (opcional)"
            placeholder="ENS ou carteira secundária (opcional)"
            autoComplete="off"
            error={errors.secondaryAddress?.message}
            {...register("secondaryAddress")}
          />

          <SelectField
            id="wallet-type"
            label="Tipo de carteira"
            required
            value={walletType}
            onChange={(value) => handleProviderChange(value as WalletProviderId)}
            options={typeOptions}
            error={errors.walletType?.message}
          />
          <TextField
            id="referral-code"
            label="Código de indicação"
            required
            autoComplete="off"
            error={errors.referralCode?.message}
            {...register("referralCode")}
          />

          <TextField
            id="email"
            label="E-mail"
            required
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            id="ens-label"
            label="Nome ENS"
            required
            suffix=".eth"
            autoComplete="off"
            error={errors.ensLabel?.message}
            {...register("ensLabel")}
          />
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={false}
            aria-disabled="true"
            onClick={() => announce("Usar outra carteira estará disponível em breve.")}
            className="flex w-fit items-center gap-2 text-small"
          >
            <span
              aria-hidden="true"
              className="size-4 shrink-0 rounded-full border-2 border-primary"
            />
            Usar outra carteira?
          </button>

          <div className="sm:max-w-[calc(50%-0.75rem)]">
            <TextAreaField
              id="collector-note"
              label="Observação do colecionador (opcional)"
              rows={4}
              error={errors.note?.message}
              {...register("note")}
            />
          </div>
        </div>
      </section>

      <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
        <CheckoutSummary
          quote={quote}
          quoteError={quoteError}
          refreshing={quoteRefreshing}
          onRetry={onRetryQuote}
        />

        <ProviderList
          provider={provider}
          onChange={handleProviderChange}
          connection={connection}
          onRetry={onRetryConnection}
          onDisconnect={onDisconnect}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-primary py-3 text-small font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Processando..." : "Confirmar compra"}
        </button>
      </aside>
    </form>
  );
}
