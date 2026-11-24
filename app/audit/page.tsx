import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import AuditPage from "@/components/modules/audit/AuditPage";

export default function Page({ searchParams }: PageProps<"/audit">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuditPage searchParams={searchParams} />
    </Suspense>
  );
}
