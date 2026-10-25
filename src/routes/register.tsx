import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/features/auth/ui/components/auth-page";
import { redirectIfAuthenticated } from "@/features/auth/ui/guards";
import { validateAuthSearch } from "@/features/auth/ui/redirect";

function RegisterRoute() {
  const { redirect } = Route.useSearch();
  return <AuthPage mode="register" redirectTo={redirect} />;
}

export const Route = createFileRoute("/register")({
  validateSearch: validateAuthSearch,
  beforeLoad: ({ context, search }) => redirectIfAuthenticated(context.queryClient, search.redirect),
  component: RegisterRoute,
});
