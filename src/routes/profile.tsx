import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/ui/guards";
import { ProfilePage } from "@/features/profile/ui/profile-page";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context, location }) =>
    requireAuth({ queryClient: context.queryClient, href: location.href }),
  component: ProfilePage,
});
