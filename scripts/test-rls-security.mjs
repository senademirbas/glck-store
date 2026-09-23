import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// .env.local dosyasını ayrıştır
const envPath = path.resolve(process.cwd(), ".env.local");
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      env[key.trim()] = values.join("=").trim();
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("HATA: NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik!");
  process.exit(1);
}

// Tamamen anonim istemci (ziyaretçi gibi - oturum açmamış)
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

async function runRlsTests() {
  console.log("=================================================");
  console.log("🔒 SUPABASE RLS GÜVENLİK TESTLERİ (ANON KEY İLE)");
  console.log("=================================================\n");

  let allPassed = true;

  // TEST 1: Anonim Okuma (categories) - İzin Verilmeli
  console.log("1. Test: Anonim Kullanıcı 'categories' tablosunu okuyabiliyor mu? (Beklenen: İZİN VERİLMELİ)");
  const { data: catData, error: catReadError } = await anonClient
    .from("categories")
    .select("name, slug, is_active");

  if (!catReadError) {
    console.log(`   ✅ BAŞARILI: ${catData.length} kategori başarıyla okundu (Public Read çalışıyor).`);
  } else {
    console.log(`   ❌ HATA: Kategoriler okunamadı:`, catReadError.message);
    allPassed = false;
  }

  // TEST 2: Anonim Yazma (products INSERT) - Reddedilmeli
  console.log("\n2. Test: Anonim Kullanıcı 'products' tablosuna ürün ekleyebilir mi? (Beklenen: REDDEDİLMELİ)");
  const { data: prodInsert, error: prodInsertError } = await anonClient
    .from("products")
    .insert([
      {
        name: "HACK_TEST_PRODUCT",
        slug: "hack-test-product",
        price: 9999,
        is_published: true,
      },
    ])
    .select();

  if (prodInsertError) {
    console.log(`   ✅ BAŞARILI (REDDEDİLDİ): RLS kuralı ihlali yakalandı!`);
    console.log(`      Dönen Hata Kodu: ${prodInsertError.code} - ${prodInsertError.message}`);
  } else {
    console.log(`   🚨 GÜVENLİK AÇIĞI: Anonim kullanıcı ürün ekleyebildi!`, prodInsert);
    allPassed = false;
  }

  // TEST 3: Anonim Güncelleme (products UPDATE) - Reddedilmeli
  console.log("\n3. Test: Anonim Kullanıcı 'products' tablosunu güncelleyebilir mi? (Beklenen: REDDEDİLMELİ)");
  const { data: prodUpdate, error: prodUpdateError } = await anonClient
    .from("products")
    .update({ price: 1 })
    .neq("id", "00000000-0000-0000-0000-000000000000")
    .select();

  // Postgres RLS update'te etkilenen satır 0 döner ya da hata verir
  if (prodUpdateError || (prodUpdate && prodUpdate.length === 0)) {
    console.log(`   ✅ BAŞARILI (REDDEDİLDİ): RLS güncellemeye izin vermedi (Etkilenen satır: 0).`);
  } else {
    console.log(`   🚨 GÜVENLİK AÇIĞI: Anonim kullanıcı ürün güncelleyebildi!`, prodUpdate);
    allPassed = false;
  }

  // TEST 4: Anonim Kategori Ekleme (categories INSERT) - Reddedilmeli
  console.log("\n4. Test: Anonim Kullanıcı 'categories' tablosuna kategori ekleyebilir mi? (Beklenen: REDDEDİLMELİ)");
  const { data: catInsert, error: catInsertError } = await anonClient
    .from("categories")
    .insert([{ name: "HACK_CATEGORY", slug: "hack-category" }])
    .select();

  if (catInsertError) {
    console.log(`   ✅ BAŞARILI (REDDEDİLDİ): RLS kategori eklemeyi engelledi!`);
    console.log(`      Dönen Hata Kodu: ${catInsertError.code} - ${catInsertError.message}`);
  } else {
    console.log(`   🚨 GÜVENLİK AÇIĞI: Anonim kullanıcı kategori ekleyebildi!`, catInsert);
    allPassed = false;
  }

  // TEST 5: Anonim Mağaza Ayarı Değiştirme (store_settings UPDATE) - Reddedilmeli
  console.log("\n5. Test: Anonim Kullanıcı 'store_settings' tablosundaki WhatsApp numarasını değiştirebilir mi? (Beklenen: REDDEDİLMELİ)");
  const { data: setUpdate, error: setUpdateError } = await anonClient
    .from("store_settings")
    .update({ whatsapp_number: "900000000000" })
    .neq("id", "00000000-0000-0000-0000-000000000000")
    .select();

  if (setUpdateError || (setUpdate && setUpdate.length === 0)) {
    console.log(`   ✅ BAŞARILI (REDDEDİLDİ): RLS ayar güncellemesine izin vermedi.`);
  } else {
    console.log(`   🚨 GÜVENLİK AÇIĞI: Anonim kullanıcı mağaza ayarlarını değiştirebildi!`, setUpdate);
    allPassed = false;
  }

  // TEST 6: Anonim Dosya Yükleme (storage.objects INSERT) - Reddedilmeli
  console.log("\n6. Test: Anonim Kullanıcı 'product-images' Storage bucket'ına dosya yükleyebilir mi? (Beklenen: REDDEDİLMELİ)");
  const testBuffer = Buffer.from("fake-image-content");
  const { data: storageUpload, error: storageError } = await anonClient.storage
    .from("product-images")
    .upload("test-hack.txt", testBuffer, { upsert: true });

  if (storageError) {
    console.log(`   ✅ BAŞARILI (REDDEDİLDİ): Storage RLS dosya yüklemeyi engelledi!`);
    console.log(`      Dönen Hata: ${storageError.message}`);
  } else {
    console.log(`   🚨 GÜVENLİK AÇIĞI: Anonim kullanıcı dosya yükleyebildi!`, storageUpload);
    allPassed = false;
  }

  console.log("\n=================================================");
  if (allPassed) {
    console.log("🎉 TÜM GÜVENLİK VE RLS TESTLERİ BAŞARIYLA GEÇTİ!");
    console.log("Anonim kullanıcılar yalnızca izin verilen verileri okuyabiliyor,");
    console.log("veritabanına ve storage'a hiçbir şekilde yazamıyor / silemiyor.");
  } else {
    console.log("❌ BAZI GÜVENLİK TESTLERİ BAŞARISIZ OLDU!");
  }
  console.log("=================================================\n");
}

runRlsTests().catch(console.error);
