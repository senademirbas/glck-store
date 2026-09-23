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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("HATA: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY bulunamadı!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@glockstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "GlockAdmin2026!";

async function main() {
  console.log(`\nAdmin hesabı kontrol ediliyor: ${ADMIN_EMAIL}...`);

  // Mevcut kullanıcıları listele
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Kullanıcı listesi alınamadı:", listError.message);
    process.exit(1);
  }

  const existing = usersData.users.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    console.log(`Admin kullanıcısı zaten mevcut (ID: ${existing.id}).`);
    console.log(`Şifre güncelleniyor...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Şifre güncellenemedi:", updateError.message);
    } else {
      console.log(`Admin şifresi başarıyla güncellendi: ${ADMIN_PASSWORD}`);
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "admin", name: "Glock Admin" },
    });

    if (error) {
      console.error("Admin hesabı oluşturulamadı:", error.message);
      process.exit(1);
    }

    console.log(`\nBAŞARILI: Tek admin kullanıcısı oluşturuldu!`);
    console.log(`E-posta: ${ADMIN_EMAIL}`);
    console.log(`Geçici Şifre: ${ADMIN_PASSWORD}`);
    console.log(`Kullanıcı ID: ${data.user.id}\n`);
  }
}

main().catch(console.error);
