"use client";

import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import Logo from "@/components/ui/Logo";

interface NavbarProps {
  whatsappNumber?: string;
}

export default function Navbar({ whatsappNumber = "905555555555" }: NavbarProps) {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" aria-label="Glock Giyim Anasayfa">
          <Logo size="md" />
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* WhatsApp Direct Line */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Merhaba Glock Giyim, ürünler hakkında bilgi almak istiyorum."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#22c55e] border border-[#27272a] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp Sipariş</span>
          </a>

          {/* Cart Button — Context'ten totalItems */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center px-3 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white transition-colors cursor-pointer"
            aria-label="Sepeti Aç"
          >
            <ShoppingBag className="w-4 h-4 text-[#e5a93b]" />
            <span className="hidden sm:inline text-xs font-semibold ml-1.5">Sepet</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e5a93b] text-[#09090b] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
