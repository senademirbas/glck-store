import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerAuthClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Admin yetkisi doğrulaması
    const authClient = await createServerAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen admin girişi yapın." },
        { status: 401 }
      );
    }

    // 2. Dosyayı form verisinden al
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Yüklenecek dosya bulunamadı." },
        { status: 400 }
      );
    }

    // 3. Dosya formatı ve boyut kontrolleri
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Yalnızca JPEG, PNG veya WebP formatında görsel yükleyebilirsiniz." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Görsel boyutu 5 MB'dan küçük olmalıdır." },
        { status: 400 }
      );
    }

    // 4. Benzersiz ve güvenli dosya adı üret
    const ext = file.name.split(".").pop() || "jpg";
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `products/${cleanName}`;

    // 5. Yetkili Admin Client (service_role) ile Storage'a güvenli yükle
    const adminClient = createAdminClient();
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from("product-images")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload hatası:", uploadError.message);
      return NextResponse.json(
        { error: `Görsel yüklenemedi: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 6. Public URL al
    const { data: urlData } = adminClient.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: unknown) {
    console.error("Upload API hatası:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
