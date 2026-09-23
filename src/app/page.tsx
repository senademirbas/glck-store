import { ShoppingBag, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#18181b] border border-[#27272a] text-[#e5a93b] mb-8">
        <Zap className="w-3.5 h-3.5" />
        <span>2026 Yeni Sezon Erkek Koleksiyonu</span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-white">
        GÜÇLÜ DURUŞ. <br />
        <span className="text-[#e5a93b]">SEÇKİN ERKEK STİLİ.</span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-[#a1a1aa] max-w-2xl leading-relaxed">
        Glock Giyim; sokak modasının tavrını kaliteli kumaşlar ve keskin kalıplarla
        buluşturuyor. Beğendiğiniz ürünü seçin, tek tıkla doğrudan WhatsApp üzerinden
        kolayca sipariş verin.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#e5a93b] text-[#09090b] font-semibold hover:bg-[#d97706] transition-colors cursor-pointer shadow-lg shadow-[#e5a93b]/10">
          <ShoppingBag className="w-5 h-5" />
          <span>Koleksiyonu Keşfet</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
          <div className="text-xs uppercase tracking-wider text-[#a1a1aa] font-semibold mb-1">
            Ödeme Entegrasyonu Yok
          </div>
          <div className="text-sm text-white font-medium">Hızlı WhatsApp Siparişi</div>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            Kart veya form doldurmadan, doğrudan mesaj yoluyla güvenli alışveriş.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
          <div className="text-xs uppercase tracking-wider text-[#a1a1aa] font-semibold mb-1">
            Seçkin Ürünler
          </div>
          <div className="text-sm text-white font-medium">Özel Tasarım & Kalıp</div>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            Her parça yüksek kalite standartlarıyla üretilmiş ve özenle seçilmiştir.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#121215] border border-[#27272a]">
          <div className="text-xs uppercase tracking-wider text-[#a1a1aa] font-semibold mb-1">
            Hızlı Teslimat
          </div>
          <div className="text-sm text-white font-medium">Aynı Gün Kargoda</div>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            Siparişiniz onaylandığı gün kargoya teslim edilerek adresinize ulaştırılır.
          </p>
        </div>
      </div>
    </main>
  );
}
