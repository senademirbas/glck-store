import type { CartItem } from "@/lib/cart/CartContext";

/**
 * Sepetteki ürünleri okunabilir WhatsApp sipariş mesajına dönüştürür.
 * İstemci tarafında çalışır ve doğrudan WhatsApp Web / Mobil uygulamasına aktarılır.
 */
export function buildWhatsAppMessage(items: CartItem[]): string {
  if (items.length === 0) return "";

  const lines = items.map(
    (item, idx) =>
      `${idx + 1}) ${item.name} — Beden: ${item.size} — ${item.quantity} adet — ${(
        item.price * item.quantity
      ).toLocaleString("tr-TR")} TL`
  );

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return [
    "Merhaba, Glock Giyim'den sipariş vermek istiyorum:",
    "",
    ...lines,
    "",
    `Toplam: ${total.toLocaleString("tr-TR")} TL`,
  ].join("\n");
}

/**
 * WhatsApp doğrudan sipariş bağlantısı (wa.me) üretir.
 */
export function buildWhatsAppUrl(whatsappNumber: string, items: CartItem[]): string {
  const message = buildWhatsAppMessage(items);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
