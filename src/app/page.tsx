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

// Next.js sayfa önbelleğini dinamik tut (ISR)
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

      <main id="koleksiyonlar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
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
          <div className="space-y-10 sm:space-y-14">
            {categoriesWithProducts.map((category) => (
              <section key={category.id} className="space-y-3.5">
                {/* Kategori Başlık Satırı */}
                <div className="flex items-end justify-between border-b border-[#27272a] pb-2.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#e5a93b]">
                      Koleksiyon
                    </span>
                    <h2 className="text-base sm:text-xl font-black tracking-tight text-white mt-0.5">
                      {category.name}
                    </h2>
                  </div>

                  <Link
                    href={`/kategori/${category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#a1a1aa] hover:text-[#e5a93b] transition-colors pb-0.5"
                  >
                    <span>Tümünü Gör ({category.total_products_count})</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* 4 Örnek Ürün: Mobilde yan yana kaydırmalı (swipeable snap), Masaüstünde 4'lü kompakt ızgara */}
                <div className="flex overflow-x-auto gap-3 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-4">
                  {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} compact={true} />
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
