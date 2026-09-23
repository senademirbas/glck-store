import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar dışındaki tüm istekleri eşleştir:
     * - _next/static (statik dosyalar)
     * - _next/image (görsel optimizasyon dosyaları)
     * - favicon.ico (favicon)
     * - Resim, font vb. uzantılar
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
