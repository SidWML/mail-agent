import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import DashboardPage from "@/components/modules/dashboard/DashboardPage";

export default function Page({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardPage searchParams={searchParams} />
    </Suspense>
  );
}
