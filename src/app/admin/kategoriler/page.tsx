"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  adminGetAllCategories,
  adminSaveCategory,
  adminDeleteCategory,
} from "@/lib/services/admin";
import type { Category } from "@/lib/types";
import { FolderTree, Plus, Edit2, Trash2, Check, X, CheckCircle2, AlertCircle, Loader2, Package } from "lucide-react";

type CategoryWithCount = Category & { product_count?: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Yeni kategori ekleme
  const [newCatName, setNewCatName] = useState("");
  const [adding, setAdding] = useState(false);

  // Satır içi (inline) düzenleme
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const data = await adminGetAllCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Yeni Kategori Ekle
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || adding) return;

    setAdding(true);
    const res = await adminSaveCategory({ name: newCatName.trim() });
    if (res.success && res.category) {
      showToast(`"${res.category.name}" kategorisi başarıyla eklendi.`);
      setNewCatName("");
      await loadCategories();
    } else {
      alert(res.error || "Kategori eklenemedi.");
    }
    setAdding(false);
  };

  // Düzenlemeyi Başlat
  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  // Düzenlemeyi Kaydet
  const handleSaveEdit = async (cat: CategoryWithCount) => {
    if (!editingName.trim() || savingEdit) return;
    if (editingName.trim() === cat.name) {
      setEditingId(null);
      return;
    }

    setSavingEdit(true);
    const res = await adminSaveCategory({
      id: cat.id,
      name: editingName.trim(),
    });

    if (res.success) {
      showToast("Kategori güncellendi.");
      setEditingId(null);
      await loadCategories();
    } else {
      alert(res.error || "Güncelleme başarısız.");
    }
    setSavingEdit(false);
  };

  // Kategori Sil (Smart Delete: Ürünleri yetim bırakmaz, category_id = null yapar)
  const handleDelete = async (cat: CategoryWithCount) => {
    const pCount = cat.product_count || 0;
    const confirmMsg =
      pCount > 0
        ? `"${cat.name}" kategorisinde ${pCount} ürün bulunuyor.\n\nKategori silindiğinde bu ürünler silinmeyecek, "Kategorisiz" olarak kalacaktır.\n\nSilmek istediğinize emin misiniz?`
        : `"${cat.name}" kategorisini silmek istediğinize emin misiniz?`;

    if (!confirm(confirmMsg)) return;

    setDeletingId(cat.id);
    const ok = await adminDeleteCategory(cat.id);
    if (ok) {
      showToast(`"${cat.name}" kategorisi silindi.`);
      await loadCategories();
    } else {
      alert("Kategori silinirken bir hata oluştu.");
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader />

      {/* Bildirim Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Başlık Alanı */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5a93b]/10 border border-[#e5a93b]/30 flex items-center justify-center text-[#e5a93b]">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Kategori Yönetimi
              </h1>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Ürünlerinizi gruplandırın. Slug ve sıralama otomatik olarak yönetilir.
              </p>
            </div>
          </div>
        </div>

        {/* Tek Adımda Hızlı Kategori Ekleme Çubuğu */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-[#27272a] shadow-lg mb-6">
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Örn: Tişört, Şapka, Aksesuar..."
                className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] placeholder:text-[#52525b]"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newCatName.trim()}
              className="px-6 py-3 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Kategori Ekle</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Kategori Listesi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
              Mevcut Kategoriler ({categories.length})
            </h2>
            <span className="text-[11px] text-[#71717a]">
              Sıralama vitrinde otomatik düzenlenir
            </span>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-[#121215] border border-[#27272a]/40 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#121215] border border-[#27272a]">
              <Package className="w-8 h-8 text-[#52525b] mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Henüz kategori bulunmuyor.</p>
              <p className="text-xs text-[#71717a] mt-1">
                Yukarıdaki alandan ilk kategorinizi kolayca ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isDeleting = deletingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isEditing
                      ? "bg-[#18181b] border-[#e5a93b] shadow-lg shadow-[#e5a93b]/5"
                      : "bg-[#121215] border-[#27272a] hover:border-[#3f3f46]"
                  }`}
                >
                  {isEditing ? (
                    // Satır İçi Düzenleme Modu
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(cat);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#09090b] border border-[#e5a93b] text-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat)}
                        disabled={savingEdit || !editingName.trim()}
                        className="p-2 rounded-lg bg-[#e5a93b] text-black hover:bg-[#d97706] transition-colors cursor-pointer disabled:opacity-50"
                        title="Kaydet"
                      >
                        {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                        title="Vazgeç"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // Normal Görüntüleme Modu
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] text-xs font-bold shrink-0">
                        📁
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate">{cat.name}</h3>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#18181b] text-[#a1a1aa] border border-[#27272a] flex items-center gap-1 shrink-0">
                            <Package className="w-3 h-3 text-[#e5a93b]" />
                            {cat.product_count ?? 0} ürün
                          </span>
                        </div>
                        <p className="text-[10px] text-[#71717a] font-mono mt-0.5 truncate">
                          /{cat.slug}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Eylemler */}
                  {!isEditing && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                        title="İsmi Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg bg-[#18181b] hover:bg-red-950/40 border border-[#27272a] text-[#71717a] hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                        title="Sil"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
