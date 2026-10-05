import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/catalog/HeroSection";
import FilterBar from "@/components/catalog/FilterBar";
import ProductCard from "@/components/catalog/ProductCard";
import { getCategories, getProducts, getStoreSettings } from "@/lib/services/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glock Giyim | Seçkin Erkek Giyim Koleksiyonu",
  description: "Modern, iddialı ve kaliteli erkek giyim koleksiyonu. Tişört, sweatshirt, pantolon, ceket modelleri. Hızlı WhatsApp siparişi.",
  openGraph: {
    title: "Glock Giyim | Seçkin Erkek Giyim",
    description: "Modern ve iddialı erkek giyim koleksiyonu.",
    type: "website",
  },
};

interface HomePageProps {
  searchParams: Promise<{
    kategori?: string;
    beden?: string;
    sirala?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.kategori;
  const size = resolvedParams.beden;
  const sort = resolvedParams.sirala as "newest" | "price_asc" | "price_desc" | undefined;

  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug, size, sort }),
    getStoreSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      <HeroSection
        title={settings?.hero_title}
        subtitle={settings?.hero_subtitle}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Filters */}
        <Suspense fallback={<div className="h-12 bg-[#121215] rounded-xl animate-pulse" />}>
          <FilterBar
            categories={categories}
            activeCategorySlug={categorySlug}
            activeSize={size}
            activeSort={sort}
          />
        </Suspense>

        {/* Product Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">
              Ürünler ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#121215] border border-[#27272a] p-8">
              <p className="text-base text-white font-medium">
                Seçtiğiniz kriterlere uygun ürün bulunamadı.
              </p>
              <p className="mt-2 text-xs text-[#71717a]">
                Filtreleri temizleyerek tüm koleksiyonumuza göz atabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer whatsappNumber={settings?.whatsapp_number} />
    </div>
  );
}
