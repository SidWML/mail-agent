import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import AccessDeniedPage from "@/components/modules/access-denied/AccessDeniedPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AccessDeniedPage />
    </Suspense>
  );
}
