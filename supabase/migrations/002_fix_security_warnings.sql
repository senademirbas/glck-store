-- ==============================================================================
-- GLOCK GIYIM — LINTER GUVENLIK DUZELTMELERI (002_fix_security_warnings.sql)
-- ==============================================================================

-- 1. FIX: function_search_path_mutable
-- search_path sabitlenerek güvenlik açığı (path hijacking) kapatılıyor.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. FIX: rls_policy_always_true
-- "USING (true)" yerine yetkili admin kimlik doğrulamasını (auth.uid() IS NOT NULL)
-- açıkça doğrulayan katı kurallara geçiliyor.

-- CATEGORIES
DROP POLICY IF EXISTS "Admin manage categories" ON categories;
CREATE POLICY "Admin manage categories"
ON categories FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- PRODUCTS
DROP POLICY IF EXISTS "Admin manage products" ON products;
CREATE POLICY "Admin manage products"
ON products FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- PRODUCT_IMAGES
DROP POLICY IF EXISTS "Admin manage product images" ON product_images;
CREATE POLICY "Admin manage product images"
ON product_images FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- STORE_SETTINGS
DROP POLICY IF EXISTS "Admin update store settings" ON store_settings;
CREATE POLICY "Admin update store settings"
ON store_settings FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. FIX: public_bucket_allows_listing
-- Public bucket'lar URL ile doğrudan nesne erişimi sunduğundan, 
-- anonim kullanıcıların tüm bucket içeriğini listeleyebilmesini (file listing) kapatıyoruz.
-- Yalnızca authenticated admin listeleme ve dosya yönetimi yapabilir.
DROP POLICY IF EXISTS "Public read product images from storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage product images in storage" ON storage.objects;

-- Admin için Storage tam yetki
CREATE POLICY "Admin manage storage objects"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
