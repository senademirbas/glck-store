export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sizes: string[];
  in_stock: boolean;
  is_published: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
}

export interface StoreSettings {
  id: string;
  whatsapp_number: string;
  hero_title: string;
  hero_subtitle: string;
  updated_at: string;
}

export interface CatalogFilterParams {
  categorySlug?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
}
