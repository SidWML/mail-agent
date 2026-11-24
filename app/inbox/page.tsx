import { Suspense } from "react";
import PageLoading from "@/components/common/PageLoading";
import InboxPage from "@/components/modules/inbox/InboxPage";

export default function Page({ searchParams }: PageProps<"/inbox">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <InboxPage searchParams={searchParams} />
    </Suspense>
  );
}
