# Glock Giyim — Görev Listesi (tasks.md)

> Antigravity'de `/speckit.tasks` karşılığı. Antigravity agent pane'ine
> bu dosyayı referans göstererek ("tasks.md'deki Faz 0'ı uygula" gibi)
> sırayla çalıştırabilirsin. Her faz kendi içinde test edilebilir olacak
> şekilde küçük tutulmuştur (constitution §6 — modüler granülarite).

## Faz 0 — Kurulum
- [ ] Next.js + TypeScript + Tailwind projesi oluştur (koyu tema temel
      renk paleti ile).
- [ ] GitHub reposu oluştur, `.gitignore`'a `.env*` ekle.
- [ ] Supabase projesi oluştur, bağlantı bilgilerini `.env.local`'e ekle.
- [ ] Vercel projesini GitHub reposuna bağla (henüz env var girmeden).

## Faz 1 — Veri modeli ve kimlik doğrulama
- [ ] `plan.md` §3'teki tabloları migration dosyası olarak yaz
      (categories, products, product_images, store_settings).
- [ ] RLS politikalarını uygula: herkes yayınlanmış ürünü okuyabilir,
      sadece admin yazabilir.
- [ ] Supabase Auth'ta tek admin kullanıcısını oluştur.
- [ ] Next.js middleware ile `/admin/*` için oturum kontrolü ekle.

## Faz 2 — Genel katalog (public)
- [ ] Anasayfa: ürün ızgarası, kategori filtre çubuğu (FR-1, FR-2).
- [ ] Kategori sayfası `/kategori/[slug]`.
- [ ] Filtre state'ini URL query parametrelerine bağla.
- [ ] Ürün detay sayfası `/urun/[slug]`: galeri, beden seçimi, "Sepete
      Ekle" (FR-3).
- [ ] Görsel optimizasyonu: `next/image`, lazy loading, responsive
      `sizes`.
- [ ] SEO: her sayfa için dinamik `<title>`/meta description, Open
      Graph etiketleri.

## Faz 3 — Sepet ve WhatsApp checkout
- [ ] Sepet state yönetimi (React context + localStorage) — FR-4.
- [ ] Sepet sayfası/paneli: adet değiştirme, ürün çıkarma, toplam tutar.
- [ ] WhatsApp mesajı oluşturma fonksiyonu + `wa.me` link üretimi
      (FR-5).
- [ ] Boş sepette "Siparişi Tamamla" butonunun devre dışı olması.

## Faz 4 — Admin paneli
- [ ] Admin giriş sayfası (Supabase Auth, rate-limitli).
- [ ] Ürün listesi (yayında/taslak/stok durumu filtreli).
- [ ] Ürün ekleme/düzenleme formu: mobil uyumlu, çoklu görsel yükleme,
      zorunlu alan doğrulama (FR-7).
- [ ] Görsel yükleme: dosya tipi/boyut doğrulama (bkz. güvenlik planı),
      otomatik sıkıştırma.
- [ ] Kategori yönetim ekranı (FR-8).
- [ ] Ayarlar ekranı: WhatsApp numarası, hero metni (FR-9).
- [ ] Soft delete: "Sil" işlemi `deleted_at` set eder, kalıcı silme ayrı
      onay adımı gerektirir.

## Faz 5 — Güvenlik sertleştirme
- [ ] Güvenlik header'larını ekle (CSP, X-Frame-Options, HSTS vb.) —
      bkz. `guvenlik-ve-test-plani.md` §3.
- [ ] Admin girişine rate limiting + kısa süreli kilitleme.
- [ ] Cloudflare WAF temel kural setini aç, temel rate limiting
      kuralını `/admin/*` ve API route'larına uygula.
- [ ] Dosya yükleme güvenliği: MIME/tür/boyut kontrolü, dosya adı
      normalize etme.
- [ ] `service_role` anahtarının yalnızca sunucu tarafı kodda
      kullanıldığını doğrula (client bundle'da aranmamalı).

## Faz 6 — Test ve QA (teslim öncesi uygunluk testleri)
- [ ] `guvenlik-ve-test-plani.md`'deki fonksiyonel test matrisini
      çalıştır.
- [ ] Lighthouse (mobil) skorlarını ölç, performans bütçesini doğrula.
- [ ] Cihaz/tarayıcı matrisinde manuel test.
- [ ] OWASP Top 10 checklist'ini işaretle.
- [ ] Admin'in gerçek telefonundan uçtan uca ürün ekleme testini
      yaptır (kabul testi).

## Faz 7 — Deploy ve teslim
- [ ] Prod environment variable'larını Vercel'de gir.
- [ ] Domain'i Cloudflare'e al, Vercel custom domain'i bağla.
- [ ] Son kez tüm akışı prod ortamda test et (ziyaretçi akışı + admin
      akışı).
- [ ] Müşteriye kısa kullanım kılavuzu (ürün nasıl eklenir, WhatsApp
      numarası nasıl değiştirilir) teslim et.
