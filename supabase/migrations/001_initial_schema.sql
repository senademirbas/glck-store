-- ==============================================================================
-- GLOCK GIYIM — VERITABANI VE GUVELIK SEMASI (001_initial_schema.sql)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. KATEGORILER (categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. URUNLER (products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sizes TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  in_stock BOOLEAN DEFAULT true NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL, -- Soft Delete (Constitution §8)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indeksler (Katalog filtreleme ve performans için - Constitution §4)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 5. URUN GORSELLERI (product_images)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- 6. MAGAZA AYARLARI (store_settings - tek satır)
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL DEFAULT '905555555555',
  hero_title TEXT DEFAULT 'GÜÇLÜ DURUŞ. SEÇKİN ERKEK STİLİ.' NOT NULL,
  hero_subtitle TEXT DEFAULT 'Özel tasarım ve kaliteli erkek giyim koleksiyonu. Doğrudan WhatsApp ile hızlı sipariş.' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_store_settings_updated_at
BEFORE UPDATE ON store_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Varsayılan ayar kaydı (tek satır kuralı)
INSERT INTO store_settings (id, whatsapp_number, hero_title, hero_subtitle)
SELECT 
  '00000000-0000-0000-0000-000000000001'::UUID,
  '905555555555',
  'GÜÇLÜ DURUŞ. SEÇKİN ERKEK STİLİ.',
  'Özel tasarım ve kaliteli erkek giyim koleksiyonu. Doğrudan WhatsApp ile hızlı sipariş.'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- Temel kategoriler başlangıç verisi (seed)
INSERT INTO categories (name, slug, sort_order)
VALUES 
  ('Tişört', 'tisort', 1),
  ('Sweatshirt & Hoodie', 'sweatshirt-hoodie', 2),
  ('Pantolon & Eşofman', 'pantolon-esofman', 3),
  ('Ceket & Mont', 'ceket-mont', 4),
  ('Aksesuar', 'aksesuar', 5)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLITIKALARI (Constitution §1, Plan §3)
-- ==============================================================================

-- RLS Etkinleştir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLITIKALARI
-- Herkes aktif kategorileri okuyabilir
CREATE POLICY "Public read active categories"
ON categories FOR SELECT
TO public
USING (is_active = true);

-- Sadece authenticated admin kategorileri yönetebilir
CREATE POLICY "Admin manage categories"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PRODUCTS POLITIKALARI
-- Herkes yayınlanmış ve silinmemiş ürünleri görebilir
CREATE POLICY "Public read published products"
ON products FOR SELECT
TO public
USING (is_published = true AND deleted_at IS NULL);

-- Sadece authenticated admin tüm ürünleri görebilir ve yönetebilir
CREATE POLICY "Admin manage products"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PRODUCT_IMAGES POLITIKALARI
-- Herkes yayınlanmış ürünlerin görsellerini okuyabilir
CREATE POLICY "Public read product images"
ON product_images FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_images.product_id
      AND p.is_published = true
      AND p.deleted_at IS NULL
  )
);

-- Sadece authenticated admin görselleri yönetebilir
CREATE POLICY "Admin manage product images"
ON product_images FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- STORE_SETTINGS POLITIKALARI
-- Herkes mağaza ayarlarını okuyabilir
CREATE POLICY "Public read store settings"
ON store_settings FOR SELECT
TO public
USING (true);

-- Sadece authenticated admin mağaza ayarlarını güncelleyebilir
CREATE POLICY "Admin update store settings"
ON store_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 8. STORAGE (product-images bucket)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Politikaları
CREATE POLICY "Public read product images from storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images to storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin update product images in storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin delete product images from storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
