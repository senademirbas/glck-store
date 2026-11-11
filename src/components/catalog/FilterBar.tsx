"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState, useEffect, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();

  // URL'deki aktif bedenler
  const activeSizesList = activeSize
    ? activeSize
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Anında görsel geri bildirim için yerel durum
  const [optimisticSizes, setOptimisticSizes] = useState<string[]>(activeSizesList);

  useEffect(() => {
    setOptimisticSizes(activeSizesList);
  }, [activeSize]);

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

  // Kategori linkleri için mevcut filtre parametrelerini koru (kategori parametresi hariç)
  const getCategoryHref = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("kategori");
    const qs = params.toString() ? `?${params.toString()}` : "";
    return slug === "all" ? `/${qs}` : `/kategori/${slug}${qs}`;
  };

  const handleSizeChange = (size: string) => {
    let newSizes: string[];
    if (optimisticSizes.includes(size)) {
      newSizes = optimisticSizes.filter((s) => s !== size);
    } else {
      newSizes = [...optimisticSizes, size];
    }

    // 0ms anında görsel güncelleme
    setOptimisticSizes(newSizes);

    const qs = createQueryString("beden", newSizes.length > 0 ? newSizes.join(",") : null);
    startTransition(() => {
      router.push(`${pathname}?${qs}`, { scroll: false });
    });
  };

  const handleSortChange = (sort: string) => {
    const qs = createQueryString("sirala", sort === "newest" ? null : sort);
    startTransition(() => {
      router.push(`${pathname}?${qs}`, { scroll: false });
    });
  };

  const clearAllFilters = () => {
    setOptimisticSizes([]);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    (activeCategorySlug && activeCategorySlug !== "all") ||
    optimisticSizes.length > 0 ||
    (activeSort && activeSort !== "newest");

  return (
    <div className="w-full space-y-4 py-4" id="katalog">
      {/* Category Pills (Next.js Link ile anında arka planda prefetch edilir, 0ms geçiş!) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={getCategoryHref("all")}
          prefetch={true}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeCategorySlug === "all" || !activeCategorySlug
              ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10 font-bold"
              : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
          }`}
        >
          Tüm Ürünler
        </Link>

        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <Link
              key={category.id}
              href={getCategoryHref(category.slug)}
              prefetch={true}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10 font-bold"
                  : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {/* Secondary Controls: Multi-Size Selector & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#27272a]/60">
        {/* Çoklu Beden Seçimi (0ms anında geri bildirim) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a] mr-1">
            Beden:
          </span>
          {SIZES.map((size) => {
            const isSelected = optimisticSizes.includes(size);
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
