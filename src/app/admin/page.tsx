import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, FolderTree, Settings, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/giris");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/giris");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Top Navbar */}
      <header className="border-b border-[#27272a] bg-[#121215]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-wider text-white text-lg">
              GLOCK <span className="text-[#e5a93b]">YÖNETİM</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#a1a1aa] hidden sm:inline">
              {user.email}
            </span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18181b] hover:bg-red-950/40 text-[#a1a1aa] hover:text-red-400 border border-[#27272a] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mağaza Yönetim Paneli
            </h1>
            <p className="mt-1 text-sm text-[#a1a1aa]">
              Ürünleri, kategorileri ve mağaza ayarlarını buradan yönetebilirsiniz.
            </p>
          </div>

          <Link
            href="/admin/urun/yeni"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-[#e5a93b]/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </Link>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/admin"
            className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] hover:border-[#e5a93b]/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#e5a93b] mb-4 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Ürün Yönetimi</h2>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              Mevcut ürünleri listeleyin, düzenleyin, stok durumunu değiştirin veya pasife alın.
            </p>
          </Link>

          <Link
            href="/admin/kategoriler"
            className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] hover:border-[#e5a93b]/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#e5a93b] mb-4 group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Kategori Yönetimi</h2>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              Tişört, pantolon, ceket gibi filtreleme kategorilerini düzenleyin.
            </p>
          </Link>

          <Link
            href="/admin/ayarlar"
            className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] hover:border-[#e5a93b]/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#e5a93b] mb-4 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Mağaza Ayarları</h2>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              WhatsApp sipariş hattı numarasını ve anasayfa vitrin başlıklarını güncelleyin.
            </p>
          </Link>
        </div>

        {/* Phase Info Box */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-[#27272a]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              Sistem Durumu (Faz 1 Tamamlandı)
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-medium">
              Oturum Aktif
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Kimlik doğrulama ve middleware koruması başarıyla çalışıyor. Faz 1 SQL şemasını
            Supabase üzerinde çalıştırdıktan sonra Faz 2 (Genel Katalog) ve Faz 4 (Admin Ürün CRUD Ekranları)
            ile ürünler eklenmeye hazır olacaktır.
          </p>
        </div>
      </main>
    </div>
  );
}
