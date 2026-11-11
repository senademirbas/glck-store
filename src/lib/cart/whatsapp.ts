import type { CartItem } from "@/lib/cart/CartContext";

/**
 * Sepetteki ürünleri okunabilir ve ayırt edilebilir WhatsApp sipariş mesajına dönüştürür.
 * Her kalemin altına doğrudan tıklanabilir ürün linki eklenir, böylece aynı isimli ürünler
 * satıcı tarafından fotoğraflı olarak anında görüntülenebilir.
 */
export function buildWhatsAppMessage(items: CartItem[], baseUrl?: string): string {
  if (items.length === 0) return "";

  // Dinamik olarak sitenin çalıştığı alan adını belirle
  const origin =
    baseUrl ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://glck-store.vercel.app");

  const lines = items.map((item, idx) => {
    const itemTotal = (item.price * item.quantity).toLocaleString("tr-TR");
    const productUrl = `${origin}/urun/${item.slug}`;

    return [
      `${idx + 1}) ${item.name}`,
      `   • Beden: ${item.size}`,
      `   • Adet: ${item.quantity}`,
      `   • Fiyat: ${itemTotal} TL`,
      `   • Ürün: ${productUrl}`,
    ].join("\n");
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return [
    "Merhaba, Glock Giyim'den sipariş vermek istiyorum:",
    "",
    lines.join("\n\n"),
    "",
    `Genel Toplam: ${total.toLocaleString("tr-TR")} TL`,
  ].join("\n");
}

/**
 * WhatsApp doğrudan sipariş bağlantısı (wa.me) üretir.
 */
export function buildWhatsAppUrl(whatsappNumber: string, items: CartItem[], baseUrl?: string): string {
  const message = buildWhatsAppMessage(items, baseUrl);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
