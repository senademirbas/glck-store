import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // tasks.md Faz 1 uyarınca middleware yalnızca /admin rotalarını korur.
  // Kamuya açık vitrin sayfaları doğrudan hızlıca render edilir.
  matcher: ["/admin/:path*"],
};
