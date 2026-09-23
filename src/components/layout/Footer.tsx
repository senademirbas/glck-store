import { MessageCircle, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  whatsappNumber?: string;
}

export default function Footer({ whatsappNumber = "905555555555" }: FooterProps) {
  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] text-[#a1a1aa] mt-auto">
      {/* Values Banner */}
      <div className="border-b border-[#27272a]/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-center text-[#e5a93b]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Doğrudan İletişim</div>
              <div className="text-xs text-[#71717a]">WhatsApp üzerinden anlık sipariş ve destek</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-center text-[#e5a93b]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Hızlı Gönderim</div>
              <div className="text-xs text-[#71717a]">Onaylanan siparişler aynı gün kargoda</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-center text-[#e5a93b]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Kalite Garantisi</div>
              <div className="text-xs text-[#71717a]">Özenle seçilmiş dayanıklı kumaşlar ve kesim</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          © {new Date().getFullYear()} <span className="text-white font-semibold">Glock Giyim</span>. Tüm hakları saklıdır.
        </div>
        <div className="flex items-center gap-4 text-[#71717a]">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e5a93b] transition-colors"
          >
            WhatsApp Hattı: +{whatsappNumber}
          </a>
          <span>•</span>
          <Link href="/admin" className="hover:text-white transition-colors">
            Yönetim
          </Link>
        </div>
      </div>
    </footer>
  );
}
