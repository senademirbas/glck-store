import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterBar from "@/components/catalog/FilterBar";
import ProductCard from "@/components/catalog/ProductCard";
import { getCategories, getProducts, getStoreSettings } from "@/lib/services/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    beden?: string;
    sirala?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    return {
      title: "Kategori Bulunamadı | Glock Giyim",
    };
  }

  return {
    title: `${currentCategory.name} Koleksiyonu | Glock Giyim`,
    description: `Seçkin ${currentCategory.name.toLowerCase()} modelleri. Kaliteli erkek giyim ve doğrudan WhatsApp siparişi.`,
    openGraph: {
      title: `${currentCategory.name} Modelleri | Glock Giyim`,
      description: `Glock Giyim ${currentCategory.name} koleksiyonu.`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  const size = resolvedParams.beden;
  const sort = resolvedParams.sirala as "newest" | "price_asc" | "price_desc" | undefined;

  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug, size, sort }),
    getStoreSettings(),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Category Banner */}
      <section className="py-12 border-b border-[#27272a] bg-[#121215]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-[#e5a93b] font-semibold">
            Kategori
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            {currentCategory.name}
          </h1>
          <p className="mt-2 text-sm text-[#a1a1aa] max-w-xl">
            En yeni Glock Giyim {currentCategory.name.toLowerCase()} tasarımlarını inceleyin.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Suspense fallback={<div className="h-12 bg-[#121215] rounded-xl animate-pulse" />}>
          <FilterBar
            categories={categories}
            activeCategorySlug={slug}
            activeSize={size}
            activeSort={sort}
          />
        </Suspense>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">
              {currentCategory.name} ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-[#121215] border border-[#27272a] p-8">
              <p className="text-base text-white font-medium">
                Bu kategoride henüz ürün bulunmuyor veya seçilen filtrelere uymuyor.
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
