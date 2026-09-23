# Glock Giyim — Teknik Plan (plan.md)

> Antigravity'de `/speckit.plan` karşılığı. `spec.md`'deki gereksinimlerin
> NASIL karşılanacağını tanımlar.

## 1. Tech stack (ücretsiz + hızlı)

| Katman | Seçim | Neden |
|---|---|---|
| Frontend | **Next.js 15** (App Router, TypeScript) | SSR/SSG ile hız + SEO, tek repo'da admin+katalog |
| Stil | **Tailwind CSS** | Hızlı, küçük bundle, koyu tema kolay |
| Veritabanı | **Supabase (PostgreSQL, free tier)** | İlişkisel veri (ürün/kategori/filtre) için uygun, Row Level Security ile güvenlik |
| Dosya depolama | **Supabase Storage** | Ürün görselleri, free tier ~1 GB |
| Kimlik doğrulama | **Supabase Auth** (tek admin kullanıcı) | Hazır, güvenli, ekstra backend yazmaya gerek yok |
| Hosting | **Vercel (Hobby/free)** | Global CDN, otomatik HTTPS, edge cache, Next.js ile birebir uyum |
| DNS/Güvenlik katmanı | **Cloudflare (free) — opsiyonel** | Tek admin + küçük hedef kitle nedeniyle ilk sürümde ZORUNLU DEĞİL. Vercel'in edge ağı + uygulama seviyesi rate limiting (Faz 5) bu ölçekte yeterli. Trafik/risk artarsa sonradan eklenir. |
| Görsel optimizasyon | **next/image** + Supabase resize | WebP/AVIF otomatik dönüşüm |
| CI/CD | **GitHub + Vercel otomatik deploy** | Push = deploy, ücretsiz |

**Alternatif (Google/Antigravity ekosistemiyle daha uyumlu):** Firebase
(Firestore + Storage + Auth) + Firebase Hosting + Cloud Run (Antigravity'nin
yerleşik Cloud Run MCP entegrasyonu ile tek komutla deploy edilebilir).
Supabase önerisi ilişkisel filtreleme (kategori+beden+fiyat) için daha
rahat sorgu imkânı sunduğundan birincil tercih; Firebase NoSQL modelinde
çoklu filtre sorguları daha fazla ön tasarım gerektirir.

## 2. Mimari genel bakış

```
Ziyaretçi (mobil/masaüstü)
   │  HTTPS
   ▼
Cloudflare (DNS proxy, WAF, rate limit)
   │
   ▼
Vercel Edge / Next.js (SSR+SSG sayfalar, /admin route'ları)
   │
   ├── Supabase Postgres  (products, categories, product_images meta)
   ├── Supabase Storage   (ürün görselleri)
   └── Supabase Auth      (yalnızca admin girişi)

Sepet → tarayıcı localStorage (sunucuya veri gitmez)
Sipariş tamamlama → client-side wa.me link (WhatsApp'a yönlendirme)
```

Sunucu tarafında "sipariş" kavramı yoktur; bu, PII/ödeme riskini ve
altyapı karmaşıklığını en aza indirir (constitution §1, §3).

## 3. Veri modeli

**categories**
| Alan | Tip | Not |
|---|---|---|
| id | uuid | PK |
| name | text | ör. "Tişört" |
| slug | text | URL için, unique |
| is_active | boolean | default true |
| sort_order | int | listeleme sırası |

**products**
| Alan | Tip | Not |
|---|---|---|
| id | uuid | PK |
| name | text | zorunlu |
| slug | text | unique, SEO için |
| description | text | |
| price | numeric | TL, zorunlu |
| category_id | uuid | FK → categories |
| sizes | text[] | ör. {S,M,L,XL} |
| in_stock | boolean | default true |
| is_published | boolean | taslak/yayın ayrımı |
| deleted_at | timestamptz | soft delete (constitution §8) |
| created_at / updated_at | timestamptz | |

**product_images**
| Alan | Tip | Not |
|---|---|---|
| id | uuid | PK |
| product_id | uuid | FK |
| storage_path | text | Supabase Storage yolu |
| sort_order | int | |

**store_settings** (tek satır)
| Alan | Tip | Not |
|---|---|---|
| whatsapp_number | text | uluslararası format, ör. 90XXXXXXXXXX |
| hero_title / hero_subtitle | text | anasayfa metinleri |

Row Level Security: `products`, `categories`, `product_images` için
**herkese SELECT (yalnızca `is_published = true` ve `deleted_at IS NULL`)**,
**yalnızca authenticated admin'e INSERT/UPDATE/DELETE** politikası.

## 4. Sayfa / route planı

```
/                        → Katalog (SSG + ISR, ör. 60 sn revalidate)
/kategori/[slug]         → Kategoriye göre filtrelenmiş katalog
/urun/[slug]             → Ürün detay (SSG + ISR)
/admin/giris             → Admin login
/admin                   → Ürün listesi (korumalı)
/admin/urun/yeni         → Ürün ekleme formu (korumalı)
/admin/urun/[id]         → Ürün düzenleme (korumalı)
/admin/kategoriler       → Kategori yönetimi (korumalı)
/admin/ayarlar           → WhatsApp numarası, hero metni (korumalı)
```

`/admin/*` route'ları Next.js middleware ile korunur: geçerli Supabase
session yoksa `/admin/giris`'e yönlendirilir. Middleware ayrıca
`/admin/*` için ek rate limiting (ör. Vercel/Cloudflare kuralı) uygular.

## 5. WhatsApp mesaj formatı (örnek)

```
Merhaba, Glock Giyim'den sipariş vermek istiyorum:

1) Slim Fit Kot Pantolon — Beden: 32 — 1 adet — 899 TL
2) Oversize Tişört — Beden: L — 2 adet — 1198 TL

Toplam: 2097 TL
```
Bu metin `encodeURIComponent` ile URL-encode edilip
`https://wa.me/<whatsapp_number>?text=...` bağlantısına eklenir. Tamamen
istemci tarafında (JavaScript) oluşturulur, sunucuya kaydedilmez.

## 6. Deploy adımları (özet)
1. GitHub reposu oluştur, Antigravity ile bu repo üzerinde çalış.
2. Supabase projesi oluştur → tabloları migration ile kur → RLS
   politikalarını uygula → admin kullanıcıyı Supabase Auth'ta oluştur.
3. `.env` değişkenlerini tanımla (`SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` — service role **yalnızca sunucu tarafı**
   fonksiyonlarda, asla client bundle'a sızdırılmaz).
4. Vercel'e bağla, environment variable'ları Vercel panelinden gir (repo
   içine `.env` commit ETME).
5. Domain'i Vercel'de custom domain olarak tanımla. **(Opsiyonel, ileri
   aşama)** Trafik artarsa domain'i Cloudflare'e taşıyıp DNS proxy + WAF
   + ek rate limiting açılabilir — ilk sürüm için gerekli değil.
6. Prod'a ilk deploy sonrası `guvenlik-ve-test-plani.md`'deki kabul
   testlerini çalıştır, sonra müşteriye teslim et.

## 7. Free tier sınırları — takip tablosu
| Servis | Ücretsiz sınır | Bu proje için risk |
|---|---|---|
| Vercel Hobby | 100 GB bant genişliği/ay | Küçük hedef kitlede düşük risk |
| Supabase Free | 500 MB DB, 1 GB storage, 2 GB transfer/ay | Görsel sayısı arttıkça storage takip edilmeli |
| Cloudflare Free | Sınırsız istek, temel WAF | Gelişmiş kurallar ücretli — temel kurallar yeterli |

Sınırlara yaklaşıldığında önce görsel sıkıştırma/CDN cache süresi
artırımı denenir (constitution §5).
