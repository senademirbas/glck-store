import React from "react";
import Logo from "@/components/ui/Logo";

interface FooterProps {
  whatsappNumber?: string;
}

export default function Footer({ whatsappNumber = "905555555555" }: FooterProps) {
  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] text-[#a1a1aa] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Sol: Sade Logo */}
        <Logo size="sm" />

        {/* Sağ: Telif & WhatsApp */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-[#71717a]">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-semibold">Glock Giyim</span>. Tüm hakları saklıdır.
          </div>
          <span className="hidden sm:inline text-[#27272a]">•</span>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e5a93b] text-[#a1a1aa] transition-colors font-medium flex items-center gap-1.5"
          >
            <span>WhatsApp: +{whatsappNumber}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
