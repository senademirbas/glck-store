"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage("Giriş başarısız: E-posta veya şifre hatalı.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch {
      setErrorMessage("Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[#121215] border border-[#27272a] shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] text-[#e5a93b] mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Glock Giyim Yönetici Girişi
        </h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          Mağaza ve katalog yönetimi için oturum açın
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
            E-posta
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717a]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@glockstore.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] text-sm focus:outline-none focus:border-[#e5a93b] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
            Şifre
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717a]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] text-sm focus:outline-none focus:border-[#e5a93b] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#e5a93b]/10"
        >
          {loading ? (
            <span>Giriş yapılıyor...</span>
          ) : (
            <>
              <span>Panele Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
        <a
          href="/"
          className="text-xs text-[#a1a1aa] hover:text-[#e5a93b] transition-colors"
        >
          ← Mağaza Vitrinine Dön
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b] text-[#f4f4f5]">
      <Suspense fallback={<div className="text-sm text-[#a1a1aa]">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
