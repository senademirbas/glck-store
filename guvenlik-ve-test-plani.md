# Glock Giyim — Güvenlik ve Test Planı

Bu belge iki amaca hizmet eder: (1) site açık/canlı olacağı için uyulması
gereken güvenlik önlemleri, (2) müşteriye teslim öncesi çalıştırılacak
uygunluk/kabul testleri.

## 1. Tehdit modeli (özet)
- Ödeme/PII verisi tutulmadığı için finansal veri sızıntısı riski düşük.
- Asıl riskler: (a) admin paneline yetkisiz erişim, (b) ürün verisi/
  görsellerin kötü niyetli değiştirilmesi veya silinmesi, (c) siteye
  aşırı istek gönderilip free tier kotasının tüketilmesi (maliyet/erişim
  DoS riski), (d) kötü amaçlı dosya yükleme.

## 2. OWASP Top 10 (2021) eşleştirmesi

| Risk | Bu projede karşılığı | Önlem |
|---|---|---|
| A01 Broken Access Control | `/admin/*` yetkisiz erişim | Middleware oturum kontrolü + Supabase RLS (server tarafında da doğrulanır, sadece UI gizleme değil) |
| A02 Cryptographic Failures | Şifre/oturum saklama | Supabase Auth (bcrypt/Argon2 hashli şifre), HTTPS zorunlu (HSTS) |
| A03 Injection | Filtre/arama parametreleri | Supabase client'ın parametreli sorguları kullanılır, ham SQL yazılmaz |
| A04 Insecure Design | Ödeme akışı | Ödeme zaten sistemde yok (constitution §3) — saldırı yüzeyi azaltılmış |
| A05 Security Misconfiguration | Header eksikliği, public storage | CSP/HSTS/X-Frame-Options header'ları, Storage bucket'larda sadece gerekli path'ler public |
| A06 Vulnerable Components | npm paket zafiyetleri | `npm audit` / Dependabot, düzenli güncelleme |
| A07 Identification & Auth Failures | Brute-force admin girişi | Rate limiting + hesap kilitleme + güçlü şifre zorunluluğu |
| A08 Software & Data Integrity | CI/CD güvenliği | Sadece GitHub → Vercel resmi entegrasyonu, secrets GitHub/Vercel'de şifreli |
| A09 Logging & Monitoring Failures | Saldırı tespiti | Başarısız giriş, 4xx/5xx patlaması, rate-limit tetiklemeleri loglanır |
| A10 SSRF | Dış URL çağıran özellik yok | Kapsam dışı — risk yok |

## 3. Uygulama seviyesi güvenlik önlemleri
- **Header'lar:** `Content-Security-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`.
- **Admin oturumu:** HttpOnly + Secure cookie, kısa yaşam süresi (Faz 1),
  şüpheli IP'den art arda 5 başarısız denemede geçici kilit.
- **Dosya yükleme:** yalnızca `image/jpeg`, `image/png`, `image/webp`;
  maksimum dosya boyutu (ör. 5 MB); dosya adı sunucu tarafında yeniden
  üretilir (path traversal önleme); yüklenen dosya bir CDN/storage
  path'inden servis edilir, doğrudan çalıştırılabilir konumda tutulmaz.
- **Rate limiting:** Cloudflare kuralı ile `/admin/giris` ve yazma
  yapan API route'ları için dakikada istek sınırı; genel sayfalarda
  bot/otomasyon trafiğine karşı temel bot yönetimi.
- **Secrets yönetimi:** `service_role` anahtarı yalnızca sunucu tarafı
  (Next.js server actions/route handlers) kodda kullanılır, repo'ya asla
  commit edilmez, Vercel environment variable olarak tutulur.
- **Bağımlılık taraması:** GitHub Dependabot açık, kritik zafiyetlerde
  otomatik PR.
- **Yedekleme:** Supabase otomatik günlük yedek (free tier'da sınırlı
  saklama süresi — kritik değişiklik öncesi manuel export önerilir).
- **KVKK notu:** Alıcılardan hesap/kişisel veri toplanmadığı için KVKK
  kapsamı minimaldir; yine de gizlilik/iletişim metninde "sipariş
  bilgileriniz WhatsApp üzerinden mağaza ile paylaşılır" ifadesi
  belirtilmelidir.

## 4. Teslim öncesi güvenlik kontrol listesi (pentest-lite)
- [ ] Admin oturumu olmadan `/admin` ve alt sayfalarına doğrudan URL ile
      erişim denenip engellendiği doğrulanır.
- [ ] Supabase REST endpoint'ine anon key ile doğrudan istek atılıp
      RLS'in yazma işlemlerini reddettiği doğrulanır.
- [ ] Ürün formuna XSS payload'ı (`<script>...`) girilip render
      sırasında kaçışlandığı (escape) doğrulanır.
- [ ] Görsel yükleme alanına `.php`/`.exe`/`.svg` (script içeren) dosya
      denenip reddedildiği doğrulanır.
- [ ] Admin girişine art arda hatalı şifre denenip kilitleme/rate limit
      tetiklendiği doğrulanır.
- [ ] Güvenlik header'larının prod'da mevcut olduğu (ör.
      securityheaders.com ile) doğrulanır.
- [ ] HTTPS zorunluluğu ve HTTP→HTTPS yönlendirmesi doğrulanır.
- [ ] `npm audit` çıktısında yüksek/kritik zafiyet kalmadığı doğrulanır.

## 5. Fonksiyonel kabul test matrisi (UAT)

| # | Senaryo | Beklenen sonuç |
|---|---|---|
| 1 | Anasayfada kategoriye göre filtrele | Sadece seçilen kategori ürünleri listelenir |
| 2 | Fiyat aralığı + beden filtresi birlikte uygula | İki filtre kesişimi doğru sonuçlanır |
| 3 | Ürün detayına gir, beden seç, sepete ekle | Sepet sayacı güncellenir |
| 4 | Sayfayı yenile | Sepet içeriği korunur (localStorage) |
| 5 | Stokta olmayan ürün | "Stokta yok" görünür, sepete eklenemez |
| 6 | Sepetten "Siparişi Tamamla" | WhatsApp'a doğru numara ve doğru ürün/tutar metniyle yönlendirilir |
| 7 | Admin geçerli bilgilerle giriş yapar | `/admin` paneline erişir |
| 8 | Admin yanlış şifre ile 5+ deneme yapar | Geçici kilit / rate limit devreye girer |
| 9 | Admin yeni ürün ekler (mobil tarayıcıdan, fotoğraflı) | Ürün 5 dakikadan kısa sürede yayında görünür |
| 10 | Admin ürünü "yayından kaldır" yapar | Ürün public listede görünmez, veritabanında kalır (soft delete) |
| 11 | Admin WhatsApp numarasını değiştirir | Yeni siparişler yeni numaraya yönlenir |

## 6. Performans ve uyumluluk testleri
- **Lighthouse (mobil, prod URL):** Performance ≥90, Accessibility ≥90,
  Best Practices ≥90, SEO ≥90.
- **Cihaz/tarayıcı matrisi:** iPhone Safari, Android Chrome, masaüstü
  Chrome/Edge/Firefox — anasayfa, filtre, ürün detay, sepet, admin giriş
  akışları.
- **Yük/kapasite:** ~50-100 eşzamanlı ziyaretçi simülasyonu (ör. k6/
  Artillery ile basit bir smoke test) — sayfa yanıt süresi 1 sn altında
  kalmalı.
- **Erişilebilirlik:** koyu tema renk kontrastı WCAG AA, tüm görsellerde
  alt metin, formlarda label eşleşmesi.

## 7. Teslim kriteri
Yukarıdaki §4 güvenlik kontrol listesi, §5 UAT matrisi ve §6 performans
hedeflerinin tamamı geçmeden site "teslim edilmeye hazır" sayılmaz.
