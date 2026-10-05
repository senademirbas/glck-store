import type { NextConfig } from "next";

const securityHeaders = [
  // Tıklama sahtekarlığını (Clickjacking) önler
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIME türü yanıltmalarını engeller
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // HTTPS bağlantısını zorunlu kılar (2 yıl)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Yalnızca güvenli origin bilgilerini iletir
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Tarayıcı özellik izinleri (Kamera sadece mobilden admin ürün görseli çekmek için 'self' açık)
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
  },
  // XSS ve izinsiz kaynak enjeksiyonunu önleyen İçerik Güvenliği Politikası (CSP)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://ndsydmfgyilbrcrrcznd.supabase.co https://*.supabase.co https://images.unsplash.com",
      "font-src 'self'",
      "connect-src 'self' https://ndsydmfgyilbrcrrcznd.supabase.co https://*.supabase.co https://api.supabase.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ndsydmfgyilbrcrrcznd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
