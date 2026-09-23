import { Zap, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export default function HeroSection({
  title = "GÜÇLÜ DURUŞ. SEÇKİN ERKEK STİLİ.",
  subtitle = "Özel tasarım ve kaliteli erkek giyim koleksiyonu. Doğrudan WhatsApp ile hızlı ve güvenli sipariş.",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 border-b border-[#27272a] bg-gradient-to-b from-[#121215] to-[#09090b]">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#e5a93b]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#18181b] border border-[#27272a] text-[#e5a93b] mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>2026 YENİ SEZON KOLEKSİYONU</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">
          {title.includes(".") ? (
            <>
              {title.split(".")[0]}. <br />
              <span className="text-[#e5a93b]">{title.split(".").slice(1).join(".")}</span>
            </>
          ) : (
            title
          )}
        </h1>

        <p className="mt-5 text-sm sm:text-base text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href="#katalog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] hover:text-[#e5a93b] transition-colors"
          >
            <span>Koleksiyonu İncele</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
