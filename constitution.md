# Glock Giyim — Proje Anayasası (Constitution)

> Antigravity'de `/speckit.constitution` karşılığı. Bu belge, her spec/plan/task
> adımında ajanın uyması gereken pazarlık edilemez ilkeleri tanımlar. Bir plan
> veya task bu ilkelerden biriyle çelişiyorsa, önce bu belge güncellenmeli veya
> ilgili adım reddedilmelidir.

## 1. Güvenlik önce gelir
- Ödeme, fatura veya kart bilgisi hiçbir katmanda işlenmez, tutulmaz.
- Alışveriş yapan ziyaretçilerden hesap açma, kişisel veri (ad, telefon, adres)
  toplama YOK. Tek istisna: kullanıcı WhatsApp'a geçtiğinde kendi rızasıyla
  paylaştığı bilgiler (bu, sistemin kapsamı dışındadır).
- Tüm admin uç noktaları kimlik doğrulama + yetkilendirme arkasındadır.
- Tüm kullanıcı girdileri (filtre, arama, form) sunucu tarafında doğrulanır.

## 2. Tek admin modeli
- Sistemde yalnızca bir yönetici hesabı vardır. Rol/izin sistemi, çoklu
  kullanıcı yönetimi kapsam dışıdır.
- Admin paneli mobil tarayıcıdan sorunsuz kullanılabilmelidir (müşteri
  telefonundan ürün ekleyecek).

## 3. Sıfır ödeme entegrasyonu
- iyzico, Stripe, banka entegrasyonu vb. YOK.
- Satın alma akışı, sepet özetini WhatsApp'a ileten bir bağlantı ile son bulur;
  ödeme ve teslimat tamamen mağaza sahibi ile alıcı arasında, sistem dışında
  yürütülür.

## 4. Performans bütçesi
- Lighthouse Performance skoru ≥ 90 (mobil).
- LCP < 2.5 sn, CLS < 0.1, TBT < 200 ms.
- Ana sayfa ilk JS yükü (gzip) < 150 KB.
- Ürün görselleri modern formatta (WebP/AVIF) ve responsive boyutlarda
  sunulur.

## 5. Ücretsiz altyapı sınırı
- Sadece seçilen servislerin ücretsiz (free/hobby) katmanları kullanılır.
- Ücretli plana geçişi zorunlu kılacak mimari karar alınmaz (ör. sürekli
  çalışan sunucu, yüksek bant genişliği gerektiren video vb.).
- Free tier limitleri aşılırsa önce önbellekleme/optimizasyon, sonra
  kapsam daraltma tercih edilir — otomatik ücretli yükseltme değil.

## 6. Basitlik ve kapsam disiplini
- Yorum/puanlama, favoriler, çoklu satıcı, gerçek zamanlı stok senkronizasyonu,
  kupon/kampanya motoru gibi özellikler kapsam dışıdır; talep gelirse ayrı bir
  spec ile ele alınır.
- Site 1-2 sayfa mantığıyla (anasayfa/katalog + ürün detay, admin panel ayrı)
  basit tutulur.

## 7. Mobil öncelik ve erişilebilirlik
- Tasarım mobile-first yapılır; masaüstü ikinci önceliktir.
- Temel erişilebilirlik: yeterli kontrast (koyu tema için WCAG AA), klavye ile
  gezinme, görsellerde alt metin.

## 8. Veri bütünlüğü
- Veritabanı şeması migration dosyalarıyla yönetilir; production'da elle
  şema değişikliği yapılmaz.
- Ürün silme "soft delete" (pasife alma) tercih edilir; kalıcı silme admin
  onayı gerektirir.

## 9. Gözlemlenebilirlik
- Başarısız admin giriş denemeleri, rate-limit aşımları ve sunucu hataları
  loglanır.
- Kritik hatalar için basit bir uyarı mekanizması (ör. e-posta) bulunur.

## 10. Marka kimliği
- Koyu tema, erkek giyim odaklı, iddialı ve profesyonel bir görsel dil.
- Şablon/klişe "generic e-ticaret" görünümünden kaçınılır; "Glock Giyim"
  markasına özgü tipografi ve vurgu rengi kullanılır.
