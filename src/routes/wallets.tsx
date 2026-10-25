import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/ui/guards";
import { WalletsPage } from "@/features/wallets/ui/wallets-page";

export const Route = createFileRoute("/wallets")({
  beforeLoad: ({ context, location }) =>
    requireAuth({ queryClient: context.queryClient, href: location.href }),
  component: WalletsPage,
});
