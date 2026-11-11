import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/catalog/HeroSection";
import ProductCard from "@/components/catalog/ProductCard";
import { getHomeCategoriesWithProducts, getStoreSettings } from "@/lib/services/products";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
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

// Next.js sayfa önbelleğini dinamik tut
export const revalidate = 60;

export default async function HomePage() {
  const [categoriesWithProducts, settings] = await Promise.all([
    getHomeCategoriesWithProducts(4),
    getStoreSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      <HeroSection
        title={settings?.hero_title}
        subtitle={settings?.hero_subtitle}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {categoriesWithProducts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#121215] border border-[#27272a] p-8">
            <ShoppingBag className="w-10 h-10 text-[#52525b] mx-auto mb-3" />
            <p className="text-base text-white font-medium">
              Henüz vitrinde ürün bulunmuyor.
            </p>
            <p className="mt-1 text-xs text-[#71717a]">
              Yeni koleksiyonlarımız çok yakında eklenecektir.
            </p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {categoriesWithProducts.map((category) => (
              <section key={category.id} className="space-y-4 sm:space-y-5">
                {/* Kategori Başlık Satırı */}
                <div className="flex items-end justify-between border-b border-[#27272a] pb-3">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#e5a93b]">
                      Koleksiyon
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-0.5">
                      {category.name}
                    </h2>
                  </div>

                  <Link
                    href={`/kategori/${category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#a1a1aa] hover:text-[#e5a93b] transition-colors pb-0.5"
                  >
                    <span>Tümünü Gör ({category.total_products_count})</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* 4 Örnek Ürün Izgarası (Mobilde 2x2, Masaüstünde 4'lü) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer whatsappNumber={settings?.whatsapp_number} />
    </div>
  );
}
