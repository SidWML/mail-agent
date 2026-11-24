import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import SettingsPage from "@/components/modules/settings/SettingsPage";

export default function Page({ searchParams }: PageProps<"/settings">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <SettingsPage searchParams={searchParams} />
    </Suspense>
  );
}
