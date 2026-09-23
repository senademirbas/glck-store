import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log("Kategoriler kontrol ediliyor...");
  const { data: categories } = await supabase.from("categories").select("*");

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c.id;
  });

  const sampleProducts = [
    {
      name: "Oversize Heavyweight Siyah Tişört",
      slug: "oversize-heavyweight-siyah-tisort",
      description: "280 gsm %100 pamuklu ağır kumaş. Düşük omuz kesim ve dayanıklı fitilli yaka. Yıkama sonrası formunu korur.",
      price: 899,
      category_id: catMap["tisort"],
      sizes: ["S", "M", "L", "XL"],
      in_stock: true,
      is_published: true,
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Acid Wash Taktiksel Hoodie",
      slug: "acid-wash-taktiksel-hoodie",
      description: "Özel asit yıkama tekniğiyle vintage antrasit görünüm. Çift katmanlı kapüşon ve metalik fermuar detayları.",
      price: 1599,
      category_id: catMap["sweatshirt-hoodie"],
      sizes: ["M", "L", "XL", "XXL"],
      in_stock: true,
      is_published: true,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Relaxed Fit Kargo Pantolon",
      slug: "relaxed-fit-kargo-pantolon",
      description: "Dayanıklı ripstop pamuklu kanvas kumaş. Geniş yan körüklü cepler ve paça ayar kordonu.",
      price: 1399,
      category_id: catMap["pantolon-esofman"],
      sizes: ["S", "M", "L", "XL"],
      in_stock: true,
      is_published: true,
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Vintage Bomber Deri Ceket",
      slug: "vintage-bomber-deri-ceket",
      description: "Seçkin eskitme hakiki deri görünümü. Taktiksel cepler, ribana manşetler ve soğuk geçirmez astar.",
      price: 3299,
      category_id: catMap["ceket-mont"],
      sizes: ["M", "L", "XL"],
      in_stock: true,
      is_published: true,
      images: [
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Dokuma Tactical Omuz Çantası",
      slug: "dokuma-tactical-omuz-cantasi",
      description: "Cordura su itici kumaş, YKK fermuarlar ve modüler askı sistemi. Günlük taşıma için ideal boyut.",
      price: 649,
      category_id: catMap["aksesuar"],
      sizes: ["Standart"],
      in_stock: false, // STOKTA YOK TESTİ İÇİN
      is_published: true,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
      ],
    },
  ];

  for (const prod of sampleProducts) {
    const { images, ...prodData } = prod;

    // Önce ürün var mı bak
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prodData.slug)
      .single();

    let productId;
    if (existing) {
      productId = existing.id;
      await supabase.from("products").update(prodData).eq("id", productId);
      console.log(`Güncellendi: ${prodData.name}`);
    } else {
      const { data: created, error } = await supabase
        .from("products")
        .insert([prodData])
        .select()
        .single();

      if (error) {
        console.error(`Ekleme hatası (${prodData.name}):`, error.message);
        continue;
      }
      productId = created.id;
      console.log(`Eklendi: ${prodData.name}`);
    }

    // Görselleri ekle
    await supabase.from("product_images").delete().eq("product_id", productId);
    for (let i = 0; i < images.length; i++) {
      await supabase.from("product_images").insert([
        {
          product_id: productId,
          storage_path: images[i],
          sort_order: i,
        },
      ]);
    }
  }

  console.log("\nÖrnek ürünler ve görseller başarıyla veritabanına aktarıldı!");
}

seed().catch(console.error);
