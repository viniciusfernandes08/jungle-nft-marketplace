import { CatalogSection } from "@/features/nfts/ui/components/catalog-section";
import { MobileCatalogBar } from "@/features/nfts/ui/components/mobile-catalog-bar";
import { BenefitsSection } from "./benefits-section";
import { BlogSection } from "./blog-section";
import { Hero } from "./hero";
import { PromoBanners } from "./promo-banners";

export function HomePage() {
  return (
    <>
      <MobileCatalogBar />
      <Hero />
      <CatalogSection />
      <PromoBanners />
      <BlogSection />
    </>
  );
}
