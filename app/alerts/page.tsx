import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import AlertsPage from "@/components/modules/alerts/AlertsPage";

export default function Page({ searchParams }: PageProps<"/alerts">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AlertsPage searchParams={searchParams} />
    </Suspense>
  );
}
