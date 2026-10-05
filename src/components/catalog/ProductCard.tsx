"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Birincil görsel
  const primaryImage =
    product.product_images && product.product_images.length > 0
      ? product.product_images[0].storage_path
      : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group flex flex-col rounded-2xl bg-[#121215] border border-[#27272a] hover:border-[#e5a93b]/40 transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <Link
        href={`/urun/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#18181b] block"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Stock Badge */}
        {!product.in_stock && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-950/80 border border-red-800 text-red-300 backdrop-blur-sm">
            Stokta Yok
          </div>
        )}

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#09090b]/80 border border-[#27272a] text-[#a1a1aa] backdrop-blur-sm">
            {product.category.name}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/urun/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#e5a93b] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Sizes Pill Display */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              {product.sizes.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-[#71717a]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#27272a]/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-medium">
              Fiyat
            </span>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {Number(product.price).toLocaleString("tr-TR")} TL
            </span>
          </div>

          <Link
            href={`/urun/${product.slug}`}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              product.in_stock
                ? "bg-[#18181b] hover:bg-[#e5a93b] text-white hover:text-[#09090b] border border-[#27272a]"
                : "bg-[#18181b]/50 text-[#52525b] border border-[#27272a]/30 cursor-not-allowed pointer-events-none"
            }`}
          >
            <span>İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
