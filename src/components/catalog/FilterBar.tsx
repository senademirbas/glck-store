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

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function FilterBar({
  categories,
  activeCategorySlug = "all",
  activeSize,
  activeSort = "newest",
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    // Eğer kategori sayfasındaysak anasayfaya dön veya query'yi ayarla
    const qs = createQueryString("kategori", slug === "all" ? null : slug);
    router.push(`${pathname}?${qs}`, { scroll: false });
  };

  const handleSizeChange = (size: string) => {
    const isCurrentlyActive = activeSize === size;
    const qs = createQueryString("beden", isCurrentlyActive ? null : size);
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
    activeSize ||
    (activeSort && activeSort !== "newest");

  return (
    <div className="w-full space-y-4 py-4" id="katalog">
      {/* Category Pills (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeCategorySlug === "all" || !activeCategorySlug
              ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10"
              : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
          }`}
        >
          Tüm Ürünler
        </button>

        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10"
                  : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Size Pills & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#27272a]/60">
        {/* Size Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a] mr-1">
            Beden:
          </span>
          {SIZES.map((size) => {
            const isSelected = activeSize === size;
            return (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "bg-white text-black ring-2 ring-[#e5a93b]"
                    : "bg-[#18181b] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] border border-[#27272a]"
                }`}
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
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs text-[#a1a1aa] hover:text-[#e5a93b] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#71717a]" />
            <select
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] text-xs text-[#f4f4f5] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#e5a93b] cursor-pointer"
            >
              <option value="newest">En Yeniler</option>
              <option value="price_asc">Fiyat: Artan</option>
              <option value="price_desc">Fiyat: Azalan</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
