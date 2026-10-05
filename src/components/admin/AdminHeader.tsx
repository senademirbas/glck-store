"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, FolderTree, Settings, LogOut, ExternalLink, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import Logo from "@/components/ui/Logo";

interface AdminHeaderProps {
  userEmail?: string;
}

export default function AdminHeader({ userEmail = "admin@glockstore.com" }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/giris");
    router.refresh();
  };

  const navItems = [
    { href: "/admin", label: "Ürünler", icon: Package },
    { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
    { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#27272a] bg-[#121215]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Badge */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-white text-base">
                  GLOCK <span className="text-[#e5a93b]">YÖNETİM</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa] font-medium hidden sm:inline">
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#18181b] text-[#e5a93b] border border-[#27272a]"
                        : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-colors"
            >
              <span>Vitrini Gör</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <span className="text-xs text-[#71717a] hidden lg:inline max-w-[150px] truncate">
              {userEmail}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18181b] hover:bg-red-950/40 text-[#a1a1aa] hover:text-red-400 border border-[#27272a] hover:border-red-900/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#27272a]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-semibold transition-colors ${
                  isActive ? "text-[#e5a93b]" : "text-[#71717a] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-semibold text-[#71717a] hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Vitrin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
