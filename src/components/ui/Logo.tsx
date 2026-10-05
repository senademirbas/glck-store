import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({
  className = "",
  size = "md",
  showText = true,
}: LogoProps) {
  // Daha büyük ve belirgin logo boyutları (Logo tasarım kuralları)
  const iconSizes = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  const subTextSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* iOS Su Tabancası Emojisi 🔫 Tarzı Amblem */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-b from-[#1c1c21] to-[#121215] border border-[#27272a] group-hover:border-[#e5a93b]/70 flex items-center justify-center p-1.5 shadow-xl shadow-black/50 transition-all duration-300 group-hover:scale-105 flex-shrink-0`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(132,204,22,0.35)]"
        >
          {/* iOS Water Pistol Emojisi (Apple 🔫 Stili) */}
          <defs>
            {/* Yeşil Gövde Gradyanı */}
            <linearGradient id="iosGreenBody" x1="15" y1="25" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="30%" stopColor="#4ade80" />
              <stop offset="70%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Üst Sarı Su Haznesi Gradyanı */}
            <linearGradient id="iosYellowTank" x1="30" y1="12" x2="75" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>

            {/* Turuncu Namlu Gradyanı */}
            <linearGradient id="iosOrangeNozzle" x1="12" y1="36" x2="26" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Kabza Sarı Panel */}
            <linearGradient id="iosGripPanel" x1="60" y1="55" x2="78" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* 1. Üst Su Haznesi (Sarı Şişe / Tank) */}
          <rect x="34" y="14" width="42" height="18" rx="9" fill="url(#iosYellowTank)" />
          {/* Tank Kapağı / Bağlantısı */}
          <rect x="29" y="18" width="6" height="10" rx="3" fill="#eab308" />
          <rect x="74" y="18" width="4" height="10" rx="2" fill="#ca8a04" />
          {/* Tank Üzeri Parlama Çizgisi */}
          <path d="M38 18C44 16 66 16 72 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

          {/* 2. Turuncu Ön Namlu / Nozul */}
          <path d="M12 40C12 36.6863 14.6863 34 18 34H26V54H18C14.6863 54 12 51.3137 12 48V40Z" fill="url(#iosOrangeNozzle)" />
          {/* Namlu Ön Ağzı */}
          <ellipse cx="14" cy="44" rx="2" ry="5" fill="#c2410c" />
          <rect x="23" y="32" width="4" height="24" rx="2" fill="#ea580c" />

          {/* 3. Ana Yeşil Gövde (Apple Plastik Su Tabancası) */}
          <path
            d="M26 34H78C82.4183 34 86 37.5817 86 42V48C86 52.4183 82.4183 56 78 56H74L79.5 77C80.8 82 77.2 86.8 72 87.2L64 87.8C59 88.2 54.8 84.8 53.8 79.8L49 56H40C38 56 36 54 36 52V52C36 50 38 48 40 48H46V42H26V34Z"
            fill="url(#iosGreenBody)"
          />

          {/* 4. Tetik Korkuluğu (Trigger Guard) */}
          <path
            d="M44 54V64C44 67.3137 46.6863 70 50 70H57"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 5. Tetik (Sarı Trigger) */}
          <path
            d="M52 56C52 61 49 63 47 64"
            stroke="#facc15"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* 6. Kabza Sarı Paneli (Grip Inlay) */}
          <path
            d="M58 58L63 80C63.5 82 65.5 83 67.5 82.5L71 81.5C72.5 81 73.2 79.5 72.8 78L68 57C67.5 55.5 66 54.8 64.5 55.2L60 56.5C58.8 56.8 58.2 57.8 58 58Z"
            fill="url(#iosGripPanel)"
          />

          {/* 7. Gövde Plastik Parlama Efektleri (Glossy Highlights) */}
          <path
            d="M28 37H76C78 37 80 38 80 40"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M56 78L59 83"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Profesyonel Tipografi & Logo Kuralları (Orantılı & Temiz) */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-white ${textSizes[size]} group-hover:text-[#e5a93b] transition-colors`}
            >
              GLOCK
            </span>
            <span
              className={`font-black tracking-tight text-[#e5a93b] ${textSizes[size]}`}
            >
              GİYİM
            </span>
          </div>
          <span
            className={`font-extrabold tracking-[0.2em] text-[#71717a] group-hover:text-[#a1a1aa] uppercase transition-colors mt-1 ${subTextSizes[size]}`}
          >
            ERKEK KOLEKSİYONU
          </span>
        </div>
      )}
    </div>
  );
}
