import { createClient } from "@/lib/supabase/client";
import type { Category, Product, StoreSettings, CatalogFilterParams, CategoryWithProducts } from "@/lib/types";

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

    // Kategori filtresi
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    } else if (filters.categorySlug && filters.categorySlug !== "all") {
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

    // Beden filtresi (tek beden veya çoklu beden overlaps desteği)
    if (filters.size) {
      const sizeList = filters.size
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (sizeList.length === 1) {
        query = query.contains("sizes", [sizeList[0]]);
      } else if (sizeList.length > 1) {
        query = query.overlaps("sizes", sizeList);
      }
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

// Ana sayfa için: her aktif kategorinin en son eklenen N ürününü ve toplam ürün sayısını getir
export async function getHomeCategoriesWithProducts(limitPerCategory = 4): Promise<CategoryWithProducts[]> {
  try {
    const categories = await getCategories();
    if (!categories || categories.length === 0) return [];

    const supabase = createClient();

    const categoryResults = await Promise.all(
      categories.map(async (cat) => {
        const { data, count, error } = await supabase
          .from("products")
          .select(
            `
            *,
            category:categories(*),
            product_images(*)
          `,
            { count: "exact" }
          )
          .eq("category_id", cat.id)
          .eq("is_published", true)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limitPerCategory);

        if (error) {
          console.error(`Kategori (${cat.name}) ürünleri getirilemedi:`, error.message);
          return null;
        }

        const products = (data as Product[]) || [];

        // Görselleri sort_order'a göre sırala
        products.forEach((p) => {
          if (p.product_images && Array.isArray(p.product_images)) {
            p.product_images.sort((a, b) => a.sort_order - b.sort_order);
          }
        });

        return {
          ...cat,
          products,
          total_products_count: count ?? products.length,
        } as CategoryWithProducts;
      })
    );

    // Yalnızca içerisinde en az 1 ürün olan kategorileri ana sayfada göster
    return categoryResults.filter(
      (cat): cat is CategoryWithProducts => cat !== null && cat.products.length > 0
    );
  } catch (err) {
    console.error("getHomeCategoriesWithProducts hatası:", err);
    return [];
  }
}
