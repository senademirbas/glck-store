import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/catalog/ProductGallery";
import AddToCartSection from "@/components/catalog/AddToCartSection";
import { getProductBySlug, getStoreSettings } from "@/lib/services/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı | Glock Giyim",
    };
  }

  const primaryImage =
    product.product_images && product.product_images.length > 0
      ? product.product_images[0].storage_path
      : undefined;

  return {
    title: `${product.name} | Glock Giyim`,
    description: product.description || `${product.name} - Glock Giyim seçkin erkek giyim koleksiyonu.`,
    openGraph: {
      title: `${product.name} — ${product.price} TL | Glock Giyim`,
      description: product.description || "",
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getStoreSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Breadcrumb */}
      <div className="border-b border-[#27272a]/60 bg-[#121215]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-[#a1a1aa] overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-white transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {product.category && (
            <>
              <Link
                href={`/kategori/${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </>
          )}
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product Detail Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Gallery */}
          <div>
            <ProductGallery
              images={product.product_images}
              productName={product.name}
            />
          </div>

          {/* Right: Info & Purchase */}
          <div className="flex flex-col space-y-6">
            <div>
              {product.category && (
                <span className="text-xs uppercase tracking-widest text-[#e5a93b] font-bold">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  {Number(product.price).toLocaleString("tr-TR")} TL
                </span>
                <span className="text-xs text-[#71717a]">KDV Dahil</span>
              </div>
            </div>

            {/* Stock status badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  product.in_stock
                    ? "bg-emerald-950/60 border border-emerald-800 text-emerald-400"
                    : "bg-red-950/60 border border-red-800 text-red-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.in_stock ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {product.in_stock ? "Stokta Var — Hemen Teslim" : "Tükendi / Stokta Yok"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-b border-[#27272a]/60 py-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  Ürün Açıklaması
                </h2>
                <p className="text-sm text-[#d4d4d8] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size & Action Buttons */}
            <AddToCartSection
              product={product}
              whatsappNumber={settings?.whatsapp_number}
            />

            {/* Guarantees Box */}
            <div className="mt-6 p-4 rounded-xl bg-[#121215] border border-[#27272a] space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
                <Truck className="w-4 h-4 text-[#e5a93b] flex-shrink-0" />
                <span>Saat 16:00'ya kadar verilen siparişler aynı gün kargoya verilir.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
                <ShieldCheck className="w-4 h-4 text-[#e5a93b] flex-shrink-0" />
                <span>%100 Orijinal kumaş ve dikiş kalitesi garantisi.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
                <RotateCcw className="w-4 h-4 text-[#e5a93b] flex-shrink-0" />
                <span>Beden uymaması durumunda kolay değişim imkanı.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer whatsappNumber={settings?.whatsapp_number} />
    </div>
  );
}
