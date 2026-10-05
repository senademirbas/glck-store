"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import {
  adminSaveProduct,
  adminSaveCategory,
  type ProductFormData,
} from "@/lib/services/admin";
import {
  Camera,
  Upload,
  X,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Layers,
} from "lucide-react";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
}

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL", "Standart"];

// Türkçe karakterleri temizleyen slug üretici
function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c",
    ğ: "g", Ğ: "g",
    ı: "i", İ: "i",
    ö: "o", Ö: "o",
    ş: "s", Ş: "s",
    ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [quickCatLoading, setQuickCatLoading] = useState(false);

  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialProduct);
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState<number | string>(initialProduct?.price || "");
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || (categories.length > 0 ? categories[0].id : "")
  );
  const [sizes, setSizes] = useState<string[]>(
    initialProduct?.sizes && initialProduct.sizes.length > 0
      ? initialProduct.sizes
      : ["M", "L", "XL"]
  );
  const [customSize, setCustomSize] = useState("");
  const [inStock, setInStock] = useState(initialProduct ? initialProduct.in_stock : true);
  const [isPublished, setIsPublished] = useState(
    initialProduct ? initialProduct.is_published : true
  );

  // Mevcut veya yüklenen görsel URL'leri
  const [images, setImages] = useState<string[]>(
    initialProduct?.product_images
      ? initialProduct.product_images.map((img) => img.storage_path)
      : []
  );

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setQuickCatLoading(true);
    try {
      const res = await adminSaveCategory({ name: newCategoryName.trim() });
      if (res.success && res.category) {
        setCategoryList((prev) => [...prev, res.category!]);
        setCategoryId(res.category.id);
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        alert(res.error || "Kategori oluşturulamadı.");
      }
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setQuickCatLoading(false);
    }
  };

  const addCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes([...sizes, customSize.trim()]);
      setCustomSize("");
    }
  };

  // Çoklu görsel yükleme işlemi — /api/admin/upload üzerinden güvenli yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage(null);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Görsel yüklenemedi.");
        }

        if (data.url) uploadedUrls.push(data.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Zorunlu alan kontrolü
    if (!name.trim()) {
      setErrorMessage("Lütfen ürün adını giriniz.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Lütfen bir kategori seçiniz.");
      return;
    }
    if (images.length === 0) {
      setErrorMessage("En az 1 adet ürün görseli yüklemelisiniz.");
      return;
    }

    setSubmitting(true);

    const payload: ProductFormData = {
      name,
      slug: slug || slugify(name),
      description,
      price: Number(price),
      category_id: categoryId,
      sizes,
      in_stock: inStock,
      is_published: isPublished,
      images,
    };

    const res = await adminSaveProduct(payload, initialProduct?.id);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setErrorMessage(res.error || "Ürün kaydedilemedi.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ürün Listesine Dön</span>
        </Link>

        <h2 className="text-lg font-bold text-white">
          {initialProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
        </h2>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
              Temel Bilgiler
            </h3>

            {/* Ürün Adı */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                Ürün Adı <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn: Oversize Heavyweight Siyah Tişört"
                className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  URL Slug (Benzersiz)
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-[#e5a93b] hover:underline"
                >
                  {autoSlug ? "Manuel Düzenle" : "Otomatik Üret"}
                </button>
              </div>
              <input
                type="text"
                required
                disabled={autoSlug}
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-xs font-mono disabled:opacity-60 focus:outline-none focus:border-[#e5a93b]"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                Ürün Açıklaması
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kumaş gramajı, kalıp detayları, yıkama talimatı vb."
                className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Görsel Yükleme Kartı */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
                Ürün Görselleri ({images.length}) <span className="text-red-400">*</span>
              </h3>
              <span className="text-[11px] text-[#71717a]">JPEG, PNG, WebP (Maks 5 MB)</span>
            </div>

            {/* Upload Buttons (Mobile Camera Friendly) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kameradan Çek / Galeriden Yükle */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-dashed border-[#e5a93b]/60 hover:border-[#e5a93b] bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#e5a93b]" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-[#e5a93b]" />
                    <span>Fotoğraf Çek / Dosya Seç</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-[11px] text-[#a1a1aa] flex items-center">
                İlk yüklenen fotoğraf vitrinde kapak görseli olarak kullanılır.
              </div>
            </div>

            {/* Yüklenen Görseller Listesi */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#18181b] border border-[#27272a] group"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Görsel ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />

                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#e5a93b] text-[#09090b] text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        KAPAK
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-red-900 text-white transition-colors cursor-pointer"
                      title="Görseli Kaldır"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Category, Sizes, Stock */}
        <div className="space-y-6">
          {/* Fiyat ve Kategori */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
              Fiyat ve Kategori
            </h3>

            {/* Fiyat */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                Fiyat (TL) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="899"
                  className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white font-extrabold text-base focus:outline-none focus:border-[#e5a93b] transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71717a]">
                  TL
                </span>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs font-medium text-[#e5a93b] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isAddingCategory ? "İptal" : "+ Yeni Kategori"}
                </button>
              </div>

              {isAddingCategory && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-[#1c1c21] border border-[#e5a93b]/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Yeni kategori adı..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-white text-xs focus:outline-none focus:border-[#e5a93b]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleQuickCreateCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={quickCatLoading || !newCategoryName.trim()}
                    onClick={handleQuickCreateCategory}
                    className="px-3 py-1.5 rounded-lg bg-[#e5a93b] hover:bg-[#d4982a] text-black font-bold text-xs disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {quickCatLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Ekle
                  </button>
                </div>
              )}

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] cursor-pointer"
              >
                {categoryList.length === 0 ? (
                  <option value="">Kategori bulunamadı (Yukarıdan ekleyin)</option>
                ) : (
                  categoryList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Beden Seçimi */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
              Beden Seçenekleri
            </h3>

            <div className="flex items-center gap-1.5 flex-wrap">
              {DEFAULT_SIZES.map((sz) => {
                const isSelected = sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`min-w-[40px] h-9 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e5a93b] text-[#09090b] shadow"
                        : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Özel Beden Ekle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Örn: 32"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white focus:outline-none focus:border-[#e5a93b]"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-semibold text-white cursor-pointer"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Durum Anahtarları */}
          <div className="p-5 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
              Yayın ve Stok Durumu
            </h3>

            {/* Stokta Var mı? */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-[#f4f4f5]">Stok Durumu</span>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-5 h-5 accent-[#e5a93b] rounded cursor-pointer"
              />
            </label>

            {/* Yayında mı? */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#f4f4f5] block">Yayına Al</span>
                <span className="text-[10px] text-[#71717a]">Kapalıysa taslak olarak kalır</span>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 accent-[#e5a93b] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-4 px-6 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-[#e5a93b]/10 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{initialProduct ? "Değişiklikleri Kaydet" : "Ürünü Yayınla"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
