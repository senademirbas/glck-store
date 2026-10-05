import { createClient } from "@/lib/supabase/client";
import type { Category, Product, StoreSettings, CatalogFilterParams } from "@/lib/types";

// Kamuya açık aktif kategorileri getir
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Kategoriler getirilemedi:", error.message);
      return [];
    }

    return (data as Category[]) || [];
  } catch (err) {
    console.error("Kategori servisi hatası:", err);
    return [];
  }
}

// Mağaza ayarlarını getir (tek satır)
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Mağaza ayarları getirilemedi:", error.message);
      return null;
    }

    return (data as StoreSettings) || null;
  } catch (err) {
    console.error("Ayar servisi hatası:", err);
    return null;
  }
}

// Filtrelenmiş katalog ürünlerini getir
export async function getProducts(filters: CatalogFilterParams = {}): Promise<Product[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        product_images(*)
      `
      )
      .eq("is_published", true)
      .is("deleted_at", null);

    // Kategori slug filtresi
    if (filters.categorySlug && filters.categorySlug !== "all") {
      // Önce kategorinin id'sini bul
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", filters.categorySlug)
        .single();

      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    // Beden filtresi (sizes array contains size)
    if (filters.size) {
      query = query.contains("sizes", [filters.size]);
    }

    // Fiyat aralığı
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      query = query.lte("price", filters.maxPrice);
    }

    // Sıralama
    if (filters.sort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (filters.sort === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Ürünler sorgulanamadı:", error.message);
      return [];
    }

    return (data as Product[]) || [];
  } catch (err) {
    console.error("Ürün servisi hatası:", err);
    return [];
  }
}

// Tekil ürün getir (slug ile)
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(*),
        product_images(*)
      `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return null;
    }

    // Görselleri sort_order'a göre sırala
    if (data.product_images && Array.isArray(data.product_images)) {
      data.product_images.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
    }

    return data as Product;
  } catch (err) {
    console.error("Ürün detay servisi hatası:", err);
    return null;
  }
}
