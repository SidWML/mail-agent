import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import TemplatesPage from "@/components/modules/templates/TemplatesPage";

export default function Page({ searchParams }: PageProps<"/templates">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TemplatesPage searchParams={searchParams} />
    </Suspense>
  );
}
