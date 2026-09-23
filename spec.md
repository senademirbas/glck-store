# Glock Giyim — Ürün Spesifikasyonu (spec.md)

> Antigravity'de `/speckit.specify` karşılığı. Bu belge NE yapılacağını
> tanımlar, NASIL yapılacağı `plan.md`'dedir. Gereksinimler EARS-benzeri
> formatla yazılmıştır: **"SİSTEM [koşul] durumunda [davranış] SAĞLAMALIDIR."**

## 1. Genel bakış
Glock Giyim, erkek giyim odaklı, tek yöneticili bir ürün kataloğu sitesidir.
Ziyaretçiler ürünlere göz atar, sepete ekler, sepeti WhatsApp üzerinden
mağaza sahibine iletir. Ödeme ve teslimat sistem dışında, WhatsApp
görüşmesiyle yürütülür.

## 2. Kullanıcı rolleri
| Rol | Tanım | Kimlik doğrulama |
|---|---|---|
| Ziyaretçi/Alıcı | Siteye giren herkes | Yok |
| Admin | Mağaza sahibi (tek kişi) | E-posta + şifre |

## 3. Fonksiyonel gereksinimler

### FR-1 Ürün Kataloğu
- FR-1.1 SİSTEM anasayfaya girildiğinde aktif (yayında) ürünleri ızgara
  (grid) düzeninde SAĞLAMALIDIR.
- FR-1.2 SİSTEM her ürün kartında görsel, ad, fiyat ve kategori
  SAĞLAMALIDIR.
- FR-1.3 SİSTEM stokta olmayan ürünleri "Stokta yok" etiketiyle
  göstermeli, sepete eklenmesini ENGELLEMELİDİR.
- FR-1.4 SİSTEM sayfalama veya "daha fazla yükle" ile ürün listesini
  performanslı biçimde SAĞLAMALIDIR (tek seferde tüm ürünleri render
  etmemeli).

### FR-2 Filtreleme ve Kategorileme
- FR-2.1 SİSTEM ürünleri kategoriye göre (ör. tişört, pantolon, ceket,
  ayakkabı, aksesuar) filtrelemeyi SAĞLAMALIDIR.
- FR-2.2 SİSTEM beden ve fiyat aralığına göre filtrelemeyi SAĞLAMALIDIR.
- FR-2.3 SİSTEM birden fazla filtrenin birlikte (kategori + beden + fiyat)
  uygulanmasını SAĞLAMALIDIR.
- FR-2.4 Filtreler URL parametrelerine yansımalı, böylece bir filtre
  sonucu link olarak paylaşılabilmelidir.

### FR-3 Ürün Detay Sayfası
- FR-3.1 SİSTEM ürüne tıklandığında büyük görsel(ler), açıklama, beden
  seçenekleri, fiyat ve "Sepete Ekle" butonu SAĞLAMALIDIR.
- FR-3.2 Birden fazla görsel varsa galeri/karusel SAĞLANMALIDIR.

### FR-4 Sepet
- FR-4.1 SİSTEM sepeti tarayıcıda (client-side, localStorage) tutmalı,
  sunucuda kalıcı sipariş kaydı OLUŞTURMAMALIDIR.
- FR-4.2 SİSTEM sepette ürün adedi, toplam tutar ve ürün çıkarma
  işlevini SAĞLAMALIDIR.
- FR-4.3 Sayfa yenilendiğinde sepet içeriği KORUNMALIDIR.

### FR-5 WhatsApp ile Satın Alma
- FR-5.1 SİSTEM "Siparişi Tamamla" butonuna basıldığında sepetteki
  ürünleri (ad, beden, adet, fiyat, toplam) okunabilir bir metne
  DÖNÜŞTÜRMELİDİR.
- FR-5.2 SİSTEM bu metni, önceden tanımlı mağaza WhatsApp numarasına
  `wa.me` bağlantısı ile (`https://wa.me/<numara>?text=<mesaj>`)
  YÖNLENDİRMELİDİR.
- FR-5.3 SİSTEM ödeme, kart bilgisi veya fatura adımı İÇERMEMELİDİR.
- FR-5.4 Mağaza WhatsApp numarası admin panelinden GÜNCELLENEBİLMELİDİR.

### FR-6 Admin Girişi
- FR-6.1 SİSTEM `/admin` altındaki tüm sayfalara sadece kimliği
  doğrulanmış admin kullanıcının ERİŞMESİNE izin VERMELİDİR.
- FR-6.2 SİSTEM başarısız giriş denemelerini SINIRLANDIRMALIDIR (rate
  limit / kısa süreli kilitleme).
- FR-6.3 Admin oturumu belirli bir süre sonra (ör. 12 saat) OTOMATİK
  SONLANMALIDIR.

### FR-7 Admin Ürün Yönetimi
- FR-7.1 SİSTEM admin'in ürün eklemesini, düzenlemesini, pasife almasını
  ve silmesini SAĞLAMALIDIR.
- FR-7.2 SİSTEM admin'in birden fazla görsel yüklemesini, görsellerin
  otomatik sıkıştırılmasını/optimize edilmesini SAĞLAMALIDIR.
- FR-7.3 Ürün formu basit ve az adımlı olmalı; telefon tarayıcısından
  fotoğraf çekip DOĞRUDAN yükleyebilmelidir.
- FR-7.4 SİSTEM zorunlu alanlar (ad, fiyat, kategori, en az 1 görsel)
  girilmeden ürünün YAYINLANMASINA izin VERMEMELİDİR.

### FR-8 Kategori Yönetimi
- FR-8.1 SİSTEM admin'in kategori eklemesini/düzenlemesini/gizlemesini
  SAĞLAMALIDIR.

### FR-9 Tema ve İçerik
- FR-9.1 SİSTEM koyu tema, erkek giyim markasına uygun tipografi ve
  ikna edici başlık/alt metinler (ör. hero bölümü) İÇERMELİDİR.
- FR-9.2 Site en az anasayfa/katalog ve ürün detay sayfası olmak üzere
  1-2 genel sayfa + ayrı bir admin alanından OLUŞMALIDIR.

## 4. Fonksiyonel olmayan gereksinimler
- **Performans:** bkz. `constitution.md` §4.
- **Güvenlik:** bkz. `guvenlik-ve-test-plani.md`.
- **Kullanılabilirlik:** 3 tıklamadan az sürede ürün bulma → sepete ekleme
  akışı.
- **SEO:** ürün ve kategori sayfaları sunucu tarafında render edilmiş
  (SSR/SSG) meta etiketlere sahip olmalı.
- **Tarayıcı desteği:** güncel Chrome, Safari, Edge, Firefox (son 2
  sürüm) + iOS/Android mobil tarayıcılar.
- **Ölçeklenebilirlik sınırı:** eşzamanlı ~50-100 ziyaretçiyi sorunsuz
  karşılamalı (küçük hedef kitle varsayımı); bunun ötesi hedef değildir.

## 5. Kapsam dışı
- Ödeme/fatura entegrasyonu
- Alıcı hesabı, giriş/kayıt
- Yorum, puanlama, favoriler
- Çoklu satıcı / çoklu admin
- Gerçek zamanlı stok senkronizasyonu (harici bir sistemle)
- Kupon/kampanya motoru
- Canlı sohbet (WhatsApp yönlendirmesi dışında)

## 6. Kabul kriterleri (özet)
- Ziyaretçi anasayfadan kategoriye göre filtreleyip bir ürünü sepete
  ekleyebilir ve WhatsApp'a yönlendirilen hazır mesajla siparişi
  iletebilir — tamamı hesap açmadan.
- Admin, telefonundan siteye girip yeni bir ürünü görseliyle birlikte
  3 dakikadan kısa sürede yayına alabilir.
- Site mobilde Lighthouse Performance ≥ 90 alır.
- OWASP Top 10'a karşı `guvenlik-ve-test-plani.md`'deki tüm maddeler
  geçer.
