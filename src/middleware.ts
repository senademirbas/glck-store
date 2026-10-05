import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Yalnızca /admin rotaları için oturum kontrolü ve yönlendirme
  matcher: ["/admin/:path*"],
};
