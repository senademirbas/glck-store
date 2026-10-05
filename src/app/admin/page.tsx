"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  adminGetProducts,
  adminToggleStock,
  adminTogglePublished,
  adminSoftDeleteProduct,
  adminRestoreProduct,
  adminPermanentDeleteProduct,
  type AdminProductFilter,
} from "@/lib/services/admin";
import type { Product } from "@/lib/types";
import {
  PlusCircle,
  Package,
  Edit,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Archive,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminProductFilter["status"]>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadProducts = async () => {
    setLoading(true);
    const data = await adminGetProducts({ status: activeTab });
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStock = async (product: Product) => {
    const nextVal = !product.in_stock;
    // İyimser güncelleme
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, in_stock: nextVal } : p))
    );
    const ok = await adminToggleStock(product.id, nextVal);
    if (ok) {
      showToast(`${product.name} — Stok durumu: ${nextVal ? "Var" : "Tükendi"}`);
    } else {
      loadProducts();
    }
  };

  const handleTogglePublished = async (product: Product) => {
    const nextVal = !product.is_published;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_published: nextVal } : p))
    );
    const ok = await adminTogglePublished(product.id, nextVal);
    if (ok) {
      showToast(`${product.name} — ${nextVal ? "Yayına alındı" : "Taslağa çekildi"}`);
    } else {
      loadProducts();
    }
  };

  const handleSoftDelete = async (product: Product) => {
    if (!confirm(`"${product.name}" ürününü çöp kutusuna taşımak istediğinize emin misiniz?`)) return;

    startTransition(async () => {
      const ok = await adminSoftDeleteProduct(product.id);
      if (ok) {
        showToast(`"${product.name}" çöp kutusuna taşındı (Soft Delete).`);
        loadProducts();
      }
    });
  };

  const handleRestore = async (product: Product) => {
    startTransition(async () => {
      const ok = await adminRestoreProduct(product.id);
      if (ok) {
        showToast(`"${product.name}" yayına geri yüklendi.`);
        loadProducts();
      }
    });
  };

  const handlePermanentDelete = async (product: Product) => {
    if (!confirm(`DİKKAT: "${product.name}" kalıcı olarak silinecek ve geri alınamayacak. Onaylıyor musunuz?`)) return;

    startTransition(async () => {
      const ok = await adminPermanentDeleteProduct(product.id);
      if (ok) {
        showToast(`"${product.name}" kalıcı olarak silindi.`);
        loadProducts();
      }
    });
  };

  const tabs = [
    { key: "all", label: "Tümü" },
    { key: "published", label: "Yayındakiler" },
    { key: "draft", label: "Taslaklar" },
    { key: "out_of_stock", label: "Tükendi" },
    { key: "deleted", label: "Çöp Kutusu" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Package className="w-7 h-7 text-[#e5a93b]" />
              <span>Ürün Yönetimi</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#a1a1aa]">
              Mağazadaki tüm ürünleri inceleyin, fiyat ve stok durumlarını anında güncelleyin.
            </p>
          </div>

          <Link
            href="/admin/urun/yeni"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-bold text-sm transition-all duration-200 shadow-lg shadow-[#e5a93b]/10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#27272a]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminProductFilter["status"])}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#e5a93b] text-[#09090b] shadow-md shadow-[#e5a93b]/10"
                    : "bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#121215] border border-[#27272a] p-8">
            <Layers className="w-10 h-10 text-[#3f3f46] mx-auto mb-3" />
            <p className="text-base font-semibold text-white">Bu filtrede ürün bulunamadı.</p>
            <p className="mt-1 text-xs text-[#71717a]">
              Yeni bir ürün ekleyebilir veya diğer sekmelere göz atabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const primaryImage =
                product.product_images && product.product_images.length > 0
                  ? product.product_images[0].storage_path
                  : null;

              const isDeleted = Boolean(product.deleted_at);

              return (
                <div
                  key={product.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isDeleted
                      ? "bg-[#121215]/40 border-red-950/50 opacity-70"
                      : "bg-[#121215] border-[#27272a] hover:border-[#3f3f46]"
                  }`}
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#18181b] border border-[#27272a] flex-shrink-0">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#52525b]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.category && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e5a93b]">
                            {product.category.name}
                          </span>
                        )}
                        {isDeleted && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                            ÇÖPTE (Soft Delete)
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-sm mt-0.5">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-sm font-extrabold text-white">
                          {Number(product.price).toLocaleString("tr-TR")} TL
                        </span>
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="text-[11px] text-[#71717a]">
                            Bedenler: {product.sizes.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Controls & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#27272a]/60">
                    {!isDeleted ? (
                      <>
                        {/* Stok Durumu Switch */}
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            product.in_stock
                              ? "bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/60"
                              : "bg-red-950/60 border border-red-800/80 text-red-400 hover:bg-red-900/60"
                          }`}
                          title="Stok durumunu değiştirmek için tıklayın"
                        >
                          <span className={`w-2 h-2 rounded-full ${product.in_stock ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span>{product.in_stock ? "Stokta Var" : "Tükendi"}</span>
                        </button>

                        {/* Yayın Durumu Switch */}
                        <button
                          onClick={() => handleTogglePublished(product)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            product.is_published
                              ? "bg-[#18181b] border border-[#27272a] text-white hover:border-[#e5a93b]"
                              : "bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40"
                          }`}
                          title="Yayın durumunu değiştirmek için tıklayın"
                        >
                          {product.is_published ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Yayında</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              <span>Taslak</span>
                            </>
                          )}
                        </button>

                        {/* Düzenle Butonu */}
                        <Link
                          href={`/admin/urun/${product.id}`}
                          className="p-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white hover:text-[#e5a93b] transition-colors"
                          title="Ürünü Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Sil (Soft Delete) Butonu */}
                        <button
                          onClick={() => handleSoftDelete(product)}
                          className="p-2 rounded-xl bg-[#18181b] hover:bg-red-950/40 border border-[#27272a] hover:border-red-900/50 text-[#71717a] hover:text-red-400 transition-colors cursor-pointer"
                          title="Çöp Kutusuna Taşı (Soft Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Çöp Kutusundaki Aksiyonlar */}
                        <button
                          onClick={() => handleRestore(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors cursor-pointer"
                          title="Yayına Geri Yükle"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Geri Yükle</span>
                        </button>

                        <button
                          onClick={() => handlePermanentDelete(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 transition-colors cursor-pointer"
                          title="Kalıcı Olarak Sil"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Kalıcı Sil</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
