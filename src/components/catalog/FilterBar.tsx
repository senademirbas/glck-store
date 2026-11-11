"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";
import { useCallback } from "react";

interface FilterBarProps {
  categories: Category[];
  activeCategorySlug?: string;
  activeSize?: string;
  activeSort?: string;
}

const SIZES = ["S", "M", "L", "XL", "XXL", "Standart"];

export default function FilterBar({
  categories,
  activeCategorySlug = "all",
  activeSize,
  activeSort = "newest",
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Aktif bedenleri diziye dönüştür (virgülle ayrılmış çoklu bedenler için: örn. "M,L")
  const activeSizesList = activeSize
    ? activeSize
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Query parametrelerini güncelle
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "" || value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (slug: string) => {
    // Mevcut filtreleri (beden, sıralama) koru ancak kategori parametresini temizle
    const params = new URLSearchParams(searchParams.toString());
    params.delete("kategori");

    const qs = params.toString() ? `?${params.toString()}` : "";
    if (slug === "all") {
      router.push(`/${qs}`, { scroll: false });
    } else {
      router.push(`/kategori/${slug}${qs}`, { scroll: false });
    }
  };

  const handleSizeChange = (size: string) => {
    let newSizes: string[];
    if (activeSizesList.includes(size)) {
      newSizes = activeSizesList.filter((s) => s !== size);
    } else {
      newSizes = [...activeSizesList, size];
    }

    const qs = createQueryString("beden", newSizes.length > 0 ? newSizes.join(",") : null);
    router.push(`${pathname}?${qs}`, { scroll: false });
  };

  const handleSortChange = (sort: string) => {
    const qs = createQueryString("sirala", sort === "newest" ? null : sort);
    router.push(`${pathname}?${qs}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    (activeCategorySlug && activeCategorySlug !== "all") ||
    activeSizesList.length > 0 ||
    (activeSort && activeSort !== "newest");

  return (
    <div className="w-full space-y-4 py-4" id="katalog">
      {/* Category Pills (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeCategorySlug === "all" || !activeCategorySlug
              ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10 font-bold"
              : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
          }`}
        >
          Tüm Ürünler
        </button>

        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <button
              type="button"
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10 font-bold"
                  : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Multi-Size Selector & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#27272a]/60">
        {/* Çoklu Beden Seçimi */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a] mr-1">
            Beden:
          </span>
          {SIZES.map((size) => {
            const isSelected = activeSizesList.includes(size);
            return (
              <button
                type="button"
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/20 ring-1 ring-[#e5a93b]"
                    : "bg-[#18181b] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] border border-[#27272a]"
                }`}
                title={isSelected ? `${size} filtresini kaldır` : `${size} bedenini ekle`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Sort & Clear */}
        <div className="flex items-center gap-3 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-[#e5a93b] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Filtreleri Temizle</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#71717a]" />
            <select
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Ürünleri Sırala"
              className="bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e5a93b] cursor-pointer"
            >
              <option value="newest">En Yeniler</option>
              <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
