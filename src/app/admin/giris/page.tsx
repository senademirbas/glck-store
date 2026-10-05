"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, ShieldAlert, Clock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Güvenlik: 5 başarısız denemede 60 sn geçici kilitleme (Brute-force koruması)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((lockedUntil - now) / 1000);
      if (diff <= 0) {
        setLockedUntil(null);
        setSecondsRemaining(0);
        setFailedAttempts(0);
        setErrorMessage(null);
      } else {
        setSecondsRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      setErrorMessage(`Çok fazla başarısız deneme. Lütfen ${secondsRemaining} saniye bekleyin.`);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          const lockTime = Date.now() + 60 * 1000;
          setLockedUntil(lockTime);
          setSecondsRemaining(60);
          setErrorMessage("Güvenlik Kilidi: 5 hatalı giriş nedeniyle oturum 60 saniye kilitlendi.");
        } else {
          setErrorMessage(`Giriş başarısız: E-posta veya şifre hatalı. (Kalan hak: ${5 - nextAttempts})`);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        setFailedAttempts(0);
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch {
      setErrorMessage("Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  const isLocked = Boolean(lockedUntil && secondsRemaining > 0);

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

      {isLocked && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-sm flex items-center gap-3">
          <Clock className="w-5 h-5 flex-shrink-0 animate-pulse text-[#e5a93b]" />
          <span>Güvenlik kilidi devrede. Kalan süre: <strong>{secondsRemaining} sn</strong></span>
        </div>
      )}

      {errorMessage && !isLocked && (
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
              disabled={isLocked}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@glockstore.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] text-sm focus:outline-none focus:border-[#e5a93b] transition-colors disabled:opacity-50"
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
              disabled={isLocked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] text-sm focus:outline-none focus:border-[#e5a93b] transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isLocked}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#e5a93b]/10"
        >
          {loading ? (
            <span>Giriş yapılıyor...</span>
          ) : isLocked ? (
            <span>Kilitli ({secondsRemaining} sn)</span>
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
