import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import CategoriesPage from "@/components/modules/categories/CategoriesPage";

export default function Page({ searchParams }: PageProps<"/categories">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CategoriesPage searchParams={searchParams} />
    </Suspense>
  );
}
