import { adminGetAllCategories } from "@/lib/services/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";

export default async function AdminNewProductPage() {
  const categories = await adminGetAllCategories();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <ProductForm categories={categories} />
      </main>
    </div>
  );
}
