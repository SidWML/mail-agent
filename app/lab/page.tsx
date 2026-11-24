import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import LabPage from "@/components/modules/lab/LabPage";

export default function Page({ searchParams }: PageProps<"/lab">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LabPage searchParams={searchParams} />
    </Suspense>
  );
}
