# Urban Streetwear — Modern E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-white?style=for-the-badge&logo=vercel)](https://urban-streetwear-demo.vercel.app)

> A modern, mobile-first e-commerce platform built for boutique streetwear and fashion brands. Powered by **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL & Cloud Storage)** with direct WhatsApp order routing.

**Live Demo:** [urban-streetwear-demo.vercel.app](https://urban-streetwear-demo.vercel.app)

---

## Features Overview

### Storefront & Customer Experience
* **Mobile-First Dark Aesthetic:** High-contrast dark mode with gold accents, optimized for responsive mobile browsing.
* **Instant Filtering & Search:** Filter apparel by category, size variations (S, M, L, XL, XXL), and real-time search with zero layout shift.
* **Interactive Cart Drawer:** Slide-out drawer with immediate quantity adjustments and live subtotal calculations.
* **Direct WhatsApp Checkout:** Automatically formats itemized orders (product titles, selected sizes, quantities, unit prices, and grand total) and redirects customers straight to the store's WhatsApp customer line.

### Admin Dashboard
* **Full Inventory Lifecycle (CRUD):** Add, update, publish/draft, and soft-delete products.
* **Mobile Camera Photo Uploads:** Capture product photos directly from a smartphone camera and upload them to Supabase Storage with instant previews.
* **Streamlined Category Management:** Automatic slug generation and sorting indexes. Create new categories inline directly inside the product editor.
* **Instant Stock Controls:** Toggle between "In Stock" and "Out of Stock" with a single click.
* **Store Customization:** Update WhatsApp contact numbers, homepage hero slogans, and promotional copy on the fly.

### Security & Architecture
* **Supabase Row-Level Security (RLS):** Strict read-only access for catalog data. All mutation operations require authenticated admin sessions.
* **Brute-Force Rate Limiting:** Locks administrative authentication for 60 seconds after 5 consecutive failed login attempts.
* **Server-Side Route Guarding:** Middleware rules ensure private `/admin` routes redirect unauthorized visitors to the login view.
* **Hardened Security Headers:** Pre-configured HSTS, Content-Security-Policy (CSP), and X-Frame-Options headers.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (Turbopack) | React Server Components, App Router & Server Actions |
| **Language** | TypeScript | Strict type safety across database schemas and UI models |
| **Styling** | Tailwind CSS | Custom dark theme with custom responsive design tokens |
| **Database & Auth** | Supabase (PostgreSQL) | PostgreSQL engine, Storage buckets, Auth, and hardened RLS |
| **Iconography** | Lucide React | Lightweight SVG icons |
| **Hosting & CI/CD** | Vercel | Global edge CDN, automated GitHub deployments |

---

## Deployment & Setup Guide

Follow this guide to deploy your own instance of this platform on **Supabase** and **Vercel**.

### Step 1: Database & Storage Setup (Supabase)

1. Create a free account at [supabase.com](https://supabase.com) and create a **New Project**.
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository, paste the entire SQL code, and click **Run**.
4. Open `supabase/migrations/002_fix_security_warnings.sql`, paste it into the SQL Editor, and click **Run** to configure Row-Level Security policies.
5. Go to **Storage** -> Click **New Bucket**:
   * Name: `product-images`
   * Check **"Public bucket"**
   * Click **Save**

---

### Step 2: Create Admin User & Seed Products (Optional)

1. Go to **Authentication** -> **Users** in your Supabase dashboard.
2. Click **Add User** -> **Create User**:
   * Enter your preferred admin email and password.
   * Toggle **"Auto Confirm User?"** to ON.
3. *(Optional)* To populate sample clothing items, run the included seeding script locally:
   ```bash
   node scripts/seed-sample-products.mjs
   ```

---

### Step 3: Deploy to Vercel

1. Push or fork this repository to your GitHub account.
2. Log into [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
3. Import your repository.
4. In the **Environment Variables** section, add the following 3 variables from your Supabase project (**Project Settings -> API**):

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon API Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Service Role Key | `eyJhbGciOi...` |

5. Click **Deploy**. Vercel will build and deploy your live storefront.

---

## Local Development

To run the application locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/senademirbas/glck-store.git
cd glck-store

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Fill in your Supabase keys in .env.local, then start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your local development server.

---

## Administration

* **Admin Portal URL:** `https://your-domain.vercel.app/admin/giris`
* Once authenticated, you can manage products, toggle stock, upload photos, create categories, and configure store settings from any device.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
