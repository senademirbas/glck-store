"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ShoppingBag, MessageCircle, Check } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp";

interface AddToCartSectionProps {
  product: Product;
  whatsappNumber?: string;
}

export default function AddToCartSection({
  product,
  whatsappNumber = "905555555555",
}: AddToCartSectionProps) {
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ""
  );
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.product_images && product.product_images.length > 0
      ? product.product_images[0].storage_path
      : "";

  const handleAddToCart = () => {
    if (!product.in_stock) return;

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      size: selectedSize || "Standart",
      image: primaryImage,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 800);
  };

  // Direkt tek ürün WhatsApp linki (hızlı sipariş)
  const directUrl = buildWhatsAppUrl(whatsappNumber, [
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      size: selectedSize || "Standart",
      image: primaryImage,
      quantity: 1,
    },
  ]);

  return (
    <div className="space-y-6 pt-4">
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
              Beden Seçin:
            </span>
            <span className="text-xs text-[#e5a93b] font-medium">Seçilen: {selectedSize}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {product.sizes.map((s) => {
              const isSelected = selectedSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  disabled={!product.in_stock}
                  className={`min-w-[48px] h-12 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? "bg-white text-black ring-2 ring-[#e5a93b]"
                      : "bg-[#18181b] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] border border-[#27272a]"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            !product.in_stock
              ? "bg-[#18181b] text-[#52525b] border border-[#27272a] cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] shadow-[#e5a93b]/10 cursor-pointer"
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              <span>Sepete Eklendi!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>{product.in_stock ? "Sepete Ekle" : "Stokta Yok"}</span>
            </>
          )}
        </button>

        {/* Direct WhatsApp for single product */}
        {product.in_stock && (
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 px-6 rounded-xl font-bold text-sm bg-[#18181b] hover:bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/40 hover:border-[#22c55e] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Hemen WhatsApp'tan Al</span>
          </a>
        )}
      </div>
    </div>
  );
}
