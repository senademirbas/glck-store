"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp";

interface CartDrawerProps {
  whatsappNumber?: string;
}

export default function CartDrawer({ whatsappNumber = "905555555555" }: CartDrawerProps) {
  const { items, isOpen, totalItems, totalPrice, removeItem, updateQuantity, closeCart } =
    useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeCart]);

  // Açıkken body scroll kilitlemesi
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, items);
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Alışveriş Sepeti"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md flex flex-col bg-[#121215] border-l border-[#27272a] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#e5a93b]" />
            <h2 className="text-base font-bold text-white">
              Sepetim
              {totalItems > 0 && (
                <span className="ml-2 text-xs font-semibold text-[#a1a1aa]">
                  ({totalItems} ürün)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            aria-label="Sepeti Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#3f3f46]" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Sepetiniz boş</p>
                <p className="mt-1 text-xs text-[#71717a]">
                  Beğendiğiniz ürünleri ekleyerek alışverişe başlayın.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-sm font-medium text-white transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-[#e5a93b]" />
                Koleksiyona Göz At
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-3 p-3 rounded-xl bg-[#18181b] border border-[#27272a]"
              >
                {/* Görsel */}
                <Link
                  href={`/urun/${item.slug}`}
                  onClick={closeCart}
                  className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#27272a] flex-shrink-0 block"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#3f3f46]" />
                    </div>
                  )}
                </Link>

                {/* Bilgiler */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link
                      href={`/urun/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-white hover:text-[#e5a93b] transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <span className="mt-1 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                      Beden: {item.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Adet Kontrolleri */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Adedi Azalt"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Adedi Artır"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {(item.price * item.quantity).toLocaleString("tr-TR")} TL
                      </span>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="p-1.5 rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        aria-label="Ürünü Sepetten Çıkar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — Toplam & Sipariş Butonu */}
        {!isEmpty && (
          <div className="border-t border-[#27272a] px-5 py-5 space-y-4 bg-[#121215]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#a1a1aa]">Toplam Tutar</span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {totalPrice.toLocaleString("tr-TR")} TL
              </span>
            </div>

            {/* WhatsApp Sipariş Butonu */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeCart}
              className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm transition-colors shadow-lg shadow-[#22c55e]/10 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Siparişi WhatsApp'tan Tamamla</span>
            </a>

            <p className="text-center text-[10px] text-[#52525b] leading-relaxed">
              Sipariş mesajı hazırlanır ve mağaza WhatsApp hattına yönlendirilirsiniz.
              Ödeme ve teslimat mağaza ile WhatsApp üzerinden yürütülür.
            </p>

            <button
              onClick={closeCart}
              className="w-full py-2.5 text-xs font-medium text-[#71717a] hover:text-white transition-colors text-center cursor-pointer"
            >
              Alışverişe Devam Et
            </button>
          </div>
        )}
      </div>
    </>
  );
}
