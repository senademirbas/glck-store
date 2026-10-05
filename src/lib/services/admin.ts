"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerAuthClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Product, StoreSettings } from "@/lib/types";

// Yardımcı: Giriş yapmış Admin kullanıcısını doğrula
async function verifyAdminAuth() {
  const authClient = await createServerAuthClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error("Yetkisiz işlem: Oturum süreniz dolmuş. Lütfen panele tekrar giriş yapın.");
  }
  return user;
}

// ------------------------------------------------------------------------------
// ÜRÜN YÖNETİMİ
// ------------------------------------------------------------------------------

export interface AdminProductFilter {
  status?: "all" | "published" | "draft" | "out_of_stock" | "deleted";
  categoryId?: string;
}

// Admin için tüm ürünleri (silinenler dahil filtrelenebilir) getir
export async function adminGetProducts(filter: AdminProductFilter = {}): Promise<Product[]> {
  try {
    const adminClient = createAdminClient();

    let query = adminClient
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        product_images(*)
      `
      )
      .order("created_at", { ascending: false });

    // Soft Delete filtresi
    if (filter.status === "deleted") {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);

      if (filter.status === "published") {
        query = query.eq("is_published", true);
      } else if (filter.status === "draft") {
        query = query.eq("is_published", false);
      } else if (filter.status === "out_of_stock") {
        query = query.eq("in_stock", false);
      }
    }

    if (filter.categoryId && filter.categoryId !== "all") {
      query = query.eq("category_id", filter.categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Admin ürünler getirilemedi:", error.message);
      return [];
    }

    const products = (data as Product[]) || [];
    products.forEach((p) => {
      if (p.product_images && Array.isArray(p.product_images)) {
        p.product_images.sort((a, b) => a.sort_order - b.sort_order);
      }
    });

    return products;
  } catch (err) {
    console.error("adminGetProducts hatası:", err);
    return [];
  }
}

// ID ile tekil ürün ve görsellerini getir
export async function adminGetProductById(id: string): Promise<Product | null> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        product_images(*)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    if (data.product_images && Array.isArray(data.product_images)) {
      data.product_images.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
    }

    return data as Product;
  } catch (err) {
    console.error("adminGetProductById hatası:", err);
    return null;
  }
}

// Anlık Stok Durumu Değiştirme
export async function adminToggleStock(id: string, in_stock: boolean): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("products").update({ in_stock }).eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminToggleStock hatası:", err);
    return false;
  }
}

// Anlık Yayın Durumu Değiştirme (Taslak / Yayında)
export async function adminTogglePublished(id: string, is_published: boolean): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("products").update({ is_published }).eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminTogglePublished hatası:", err);
    return false;
  }
}

// Soft Delete (Çöp Kutusuna Gönderme)
export async function adminSoftDeleteProduct(id: string): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminSoftDeleteProduct hatası:", err);
    return false;
  }
}

// Soft Delete Geri Yükle
export async function adminRestoreProduct(id: string): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminRestoreProduct hatası:", err);
    return false;
  }
}

// Kalıcı Silme (Sadece onaylı)
export async function adminPermanentDeleteProduct(id: string): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("products").delete().eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminPermanentDeleteProduct hatası:", err);
    return false;
  }
}

// ------------------------------------------------------------------------------
// ÜRÜN OLUŞTURMA & GÜNCELLEME
// ------------------------------------------------------------------------------

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  sizes: string[];
  in_stock: boolean;
  is_published: boolean;
  images: string[];
}

export async function adminSaveProduct(
  formData: ProductFormData,
  productId?: string
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    await verifyAdminAuth();

    // Zorunlu alan kontrolü
    if (!formData.name?.trim()) return { success: false, error: "Ürün adı zorunludur." };
    if (!formData.price || formData.price <= 0) return { success: false, error: "Geçerli bir fiyat giriniz." };
    if (!formData.category_id) return { success: false, error: "Kategori seçimi zorunludur." };
    if (!formData.images || formData.images.length === 0) {
      return { success: false, error: "En az 1 ürün görseli yüklemelisiniz." };
    }

    const adminClient = createAdminClient();

    const productPayload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description?.trim() || null,
      price: formData.price,
      category_id: formData.category_id,
      sizes: formData.sizes || [],
      in_stock: formData.in_stock,
      is_published: formData.is_published,
    };

    let savedId = productId;

    if (productId) {
      // Güncelle
      const { error } = await adminClient
        .from("products")
        .update(productPayload)
        .eq("id", productId);
      if (error) throw error;
    } else {
      // Yeni Ekle
      const { data, error } = await adminClient
        .from("products")
        .insert([productPayload])
        .select("id")
        .single();
      if (error) throw error;
      savedId = data.id;
    }

    if (!savedId) throw new Error("Ürün ID'si oluşturulamadı.");

    // Görselleri güncelle (öncekileri silip yenileri sıralı ekle)
    await adminClient.from("product_images").delete().eq("product_id", savedId);

    if (formData.images.length > 0) {
      const imageInserts = formData.images.map((url, idx) => ({
        product_id: savedId,
        storage_path: url,
        sort_order: idx,
      }));
      const { error: imgError } = await adminClient.from("product_images").insert(imageInserts);
      if (imgError) console.error("Görsel kayıt hatası:", imgError.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, productId: savedId };
  } catch (err: unknown) {
    console.error("adminSaveProduct hatası:", err);
    return { success: false, error: err instanceof Error ? err.message : "Ürün kaydedilemedi." };
  }
}

// ------------------------------------------------------------------------------
// KATEGORİ YÖNETİMİ
// ------------------------------------------------------------------------------

// Türkçe karakterleri temizleyen otomatik slug üretici
function slugifyCategory(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
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

export async function adminGetAllCategories(): Promise<(Category & { product_count?: number })[]> {
  try {
    const adminClient = createAdminClient();
    const { data: categories, error } = await adminClient
      .from("categories")
      .select("*, products(id)")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Kategoriler getirilemedi:", error.message);
      return [];
    }

    return (categories || []).map((cat) => ({
      ...cat,
      product_count: Array.isArray(cat.products) ? cat.products.length : 0,
    })) as (Category & { product_count?: number })[];
  } catch (err) {
    console.error("adminGetAllCategories hatası:", err);
    return [];
  }
}

export async function adminSaveCategory(
  category: { id?: string; name: string; slug?: string; sort_order?: number; is_active?: boolean }
): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    await verifyAdminAuth();

    if (!category.name?.trim()) return { success: false, error: "Lütfen bir kategori adı yazın." };

    const adminClient = createAdminClient();
    const cleanName = category.name.trim();

    // Otomatik slug üretimi
    let cleanSlug = category.slug?.trim() || slugifyCategory(cleanName);
    if (!cleanSlug) cleanSlug = `kat-${Date.now().toString(36)}`;

    // Sıralama numarası (verilmemişse listenin sonuna ekle)
    let sortOrder = category.sort_order;
    if (sortOrder === undefined || sortOrder === null) {
      const { data: countData } = await adminClient.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      sortOrder = countData && countData.length > 0 ? (countData[0].sort_order || 0) + 1 : 1;
    }

    let savedCategory: Category | null = null;

    if (category.id) {
      // Güncelle
      const { data, error } = await adminClient
        .from("categories")
        .update({
          name: cleanName,
          slug: cleanSlug,
          sort_order: sortOrder,
          is_active: category.is_active !== undefined ? category.is_active : true,
        })
        .eq("id", category.id)
        .select()
        .single();

      if (error) throw error;
      savedCategory = data as Category;
    } else {
      // Yeni Ekle (Slug çakışması varsa güvenli benzersiz yap)
      const { data: existing } = await adminClient.from("categories").select("id").eq("slug", cleanSlug).maybeSingle();
      if (existing) {
        cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const { data, error } = await adminClient
        .from("categories")
        .insert([
          {
            name: cleanName,
            slug: cleanSlug,
            sort_order: sortOrder,
            is_active: category.is_active !== undefined ? category.is_active : true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      savedCategory = data as Category;
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/kategoriler");
    return { success: true, category: savedCategory || undefined };
  } catch (err: unknown) {
    console.error("adminSaveCategory hatası:", err);
    return { success: false, error: err instanceof Error ? err.message : "Kategori kaydedilemedi." };
  }
}

// Akıllı Silme (Smart Delete): Bağlı ürünleri boşa düşürerek veritabanı kilitlenmesini engeller
export async function adminDeleteCategory(id: string): Promise<boolean> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();

    // 1. Bu kategoriye bağlı ürünlerin category_id'sini null yap (ürünler asla silinmez, kaybolmaz)
    await adminClient
      .from("products")
      .update({ category_id: null })
      .eq("category_id", id);

    // 2. Kategoriyi güvenle sil
    const { error } = await adminClient.from("categories").delete().eq("id", id);
    if (!error) {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/kategoriler");
      return true;
    }
    return false;
  } catch (err) {
    console.error("adminDeleteCategory hatası:", err);
    return false;
  }
}

// ------------------------------------------------------------------------------
// MAĞAZA AYARLARI
// ------------------------------------------------------------------------------

export async function adminGetStoreSettings(): Promise<StoreSettings | null> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("store_settings").select("*").limit(1).single();
    if (error || !data) return null;
    return data as StoreSettings;
  } catch (err) {
    console.error("adminGetStoreSettings hatası:", err);
    return null;
  }
}

export async function adminUpdateStoreSettings(
  settings: Partial<StoreSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdminAuth();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("store_settings")
      .update({
        whatsapp_number: settings.whatsapp_number?.trim(),
        hero_title: settings.hero_title?.trim(),
        hero_subtitle: settings.hero_subtitle?.trim(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) throw error;

    // Anasayfa ve tüm sayfaların önbelleğini anında temizle
    revalidatePath("/", "layout");
    revalidatePath("/admin/ayarlar");
    return { success: true };
  } catch (err: unknown) {
    console.error("adminUpdateStoreSettings hatası:", err);
    return { success: false, error: err instanceof Error ? err.message : "Ayarlar kaydedilemedi." };
  }
}
