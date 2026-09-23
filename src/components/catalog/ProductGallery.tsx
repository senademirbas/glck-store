"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const imageList =
    images.length > 0
      ? images.map((img) => img.storage_path)
      : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Display */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#18181b] border border-[#27272a]">
        <Image
          src={imageList[activeIndex]}
          alt={`${productName} - Görsel ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnails (Only show if multiple images exist) */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {imageList.map((imgUrl, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[3/4] w-20 rounded-xl overflow-hidden bg-[#18181b] border transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? "border-[#e5a93b] ring-2 ring-[#e5a93b]/50 scale-105"
                    : "border-[#27272a] opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Küçük önizleme ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
