import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/home/ui/home-page";
import { validateCatalogSearch } from "@/features/nfts/ui/catalog-search";

export const Route = createFileRoute("/")({
  validateSearch: validateCatalogSearch,
  component: HomePage,
});
