"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminGetStoreSettings, adminUpdateStoreSettings } from "@/lib/services/admin";
import { Settings, MessageCircle, Type, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await adminGetStoreSettings();
      if (data) {
        setWhatsappNumber(data.whatsapp_number || "905555555555");
        setHeroTitle(data.hero_title || "GÜÇLÜ DURUŞ. SEÇKİN ERKEK STİLİ.");
        setHeroSubtitle(
          data.hero_subtitle ||
            "Özel tasarım ve kaliteli erkek giyim koleksiyonu. Doğrudan WhatsApp ile hızlı ve güvenli sipariş."
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Telefon no temizliği
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Lütfen geçerli bir telefon numarası giriniz (örn: 905555555555).");
      return;
    }

    setSaving(true);
    const res = await adminUpdateStoreSettings({
      whatsapp_number: cleanPhone,
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
    });

    if (res.success) {
      showToast("Mağaza ayarları başarıyla kaydedildi!");
      router.refresh();
    } else {
      setError(res.error || "Ayarlar kaydedilemedi.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#e5a93b]" />
            <span>Mağaza Ayarları</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#a1a1aa]">
            WhatsApp sipariş hattı numarasını ve anasayfa vitrin başlıklarını buradan yönetebilirsiniz.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse space-y-4">
            <div className="h-6 w-48 bg-[#18181b] rounded" />
            <div className="h-12 w-full bg-[#18181b] rounded" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* WhatsApp Sipariş Hattı */}
            <div className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
              <div className="flex items-center gap-2.5 text-[#22c55e]">
                <MessageCircle className="w-5 h-5 fill-current" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  WhatsApp Sipariş Hattı
                </h2>
              </div>
              <p className="text-xs text-[#a1a1aa]">
                Müşterilerin sepeti tamamladığında yönlendirileceği WhatsApp numarasıdır. Başında ülke kodu ile birlikte giriniz (örn: 905555555555).
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71717a]">
                    +
                  </span>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="905555555555"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm font-mono focus:outline-none focus:border-[#22c55e] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Vitrin ve Marka Metinleri */}
            <div className="p-6 rounded-2xl bg-[#121215] border border-[#27272a] space-y-4">
              <div className="flex items-center gap-2.5 text-[#e5a93b]">
                <Type className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Anasayfa Vitrin Metinleri (Hero Bölümü)
                </h2>
              </div>
              <p className="text-xs text-[#a1a1aa]">
                Anasayfanın en üstünde yer alan dikkat çekici ana slogan ve açıklama metnidir.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  Vitrin Ana Başlığı (Hero Title)
                </label>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="GÜÇLÜ DURUŞ. SEÇKİN ERKEK STİLİ."
                  className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  Vitrin Alt Başlığı (Hero Subtitle)
                </label>
                <textarea
                  rows={3}
                  required
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Özel tasarım ve kaliteli erkek giyim koleksiyonu..."
                  className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#e5a93b] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Kaydet Butonu */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 px-6 rounded-xl bg-[#e5a93b] hover:bg-[#d97706] text-[#09090b] font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-[#e5a93b]/10 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Ayarları Kaydet</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
