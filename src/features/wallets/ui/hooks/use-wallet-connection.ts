import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { container } from "@/app/container";
import { errorMessage } from "@/lib/error-message";
import type { WalletProviderId } from "../../domain/wallet";
import type { WalletConnectionResult } from "../../domain/wallet-connection";

export type WalletConnectionState =
  | { status: "idle" }
  | { status: "connecting"; providerId: WalletProviderId }
  | { status: "connected"; providerId: WalletProviderId }
  | { status: "refused"; providerId: WalletProviderId; reason: string };

export function useWalletConnection() {
  const connectMutation = useMutation<WalletConnectionResult, Error, WalletProviderId>({
    mutationFn: (providerId) => container.walletConnection.connect(providerId),
  });
  const disconnectMutation = useMutation<void, Error, void>({
    mutationFn: () => container.walletConnection.disconnect(),
    onSuccess: () => connectMutation.reset(),
  });

  const { mutate: connectMutate, reset: resetConnect } = connectMutation;
  const { mutate: disconnectMutate, isPending: isDisconnecting } = disconnectMutation;

  const providerId = connectMutation.variables;
  let state: WalletConnectionState = { status: "idle" };

  if (providerId) {
    if (connectMutation.isPending) {
      state = { status: "connecting", providerId };
    } else if (connectMutation.error) {
      state = { status: "refused", providerId, reason: errorMessage(connectMutation.error) };
    } else if (connectMutation.data?.status === "refused") {
      state = {
        status: "refused",
        providerId,
        reason: connectMutation.data.reason,
      };
    } else if (connectMutation.data?.status === "connected") {
      state = { status: "connected", providerId };
    }
  }

  const connect = useCallback(
    (next: WalletProviderId) => {
      if (isDisconnecting) return;
      connectMutate(next);
    },
    [connectMutate, isDisconnecting],
  );
  const disconnect = useCallback(() => {
    disconnectMutate();
  }, [disconnectMutate]);
  const reset = useCallback(() => resetConnect(), [resetConnect]);

  return {
    state,
    connect,
    disconnect,
    isDisconnecting,
    reset,
  };
}
