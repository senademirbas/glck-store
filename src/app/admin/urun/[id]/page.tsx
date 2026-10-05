import { adminGetAllCategories, adminGetProductById } from "@/lib/services/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    adminGetAllCategories(),
    adminGetProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <ProductForm categories={categories} initialProduct={product} />
      </main>
    </div>
  );
}
