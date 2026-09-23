"use client";

import Link from "next/link";
import { ShoppingBag, MessageCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  whatsappNumber?: string;
}

export default function Navbar({ whatsappNumber = "905555555555" }: NavbarProps) {
  const [cartCount, setCartCount] = useState<number>(0);

  // Faz 3 sepet entegrasyonu için localStorage dinleyicisi
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("glock_cart") || "[]");
        const total = cart.reduce((acc: number, item: { quantity: number }) => acc + (item.quantity || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#e5a93b] text-[#09090b] flex items-center justify-center font-black text-lg tracking-tighter">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-white text-base sm:text-lg leading-none group-hover:text-[#e5a93b] transition-colors">
              GLOCK <span className="text-[#e5a93b]">GIYIM</span>
            </span>
            <span className="text-[10px] text-[#71717a] font-medium tracking-widest uppercase">
              Erkek Koleksiyonu
            </span>
          </div>
        </Link>

        {/* Quick Nav & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* WhatsApp Direct Line */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Merhaba Glock Giyim, ürünler hakkında bilgi almak istiyorum.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#22c55e] border border-[#27272a] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp Sipariş</span>
          </a>

          {/* Admin Giriş İkonu (Gizli/Şık) */}
          <Link
            href="/admin"
            title="Yönetici Girişi"
            className="p-2 rounded-lg text-[#71717a] hover:text-[#e5a93b] hover:bg-[#18181b] transition-colors"
          >
            <Shield className="w-4 h-4" />
          </Link>

          {/* Cart Trigger Button */}
          <Link
            href="/#sepet"
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white transition-colors"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4 text-[#e5a93b]" />
            <span className="hidden sm:inline text-xs font-semibold ml-1.5">Sepet</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e5a93b] text-[#09090b] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
