import Icon from "@/components/ui/Icon";
import { USERS } from "@/server/store"; // Dummy backend only: a real app would not know the user list.
import { getCurrentUserId } from "@/services/http";
import AccessDeniedHeader from "./AccessDeniedHeader";
import DemoUserSwitch from "./DemoUserSwitch";

/**
 * Shown to people outside the mailbox groups (API error NO_MAILBOX_ACCESS).
 * Does not use AppShell or call the API: those calls would fail again and loop back here.
 */
export default async function AccessDeniedPage() {
  const userId = await getCurrentUserId();
  const email = USERS.find((user) => user.id === userId)?.email ?? "an unknown account";

  return (
    <div className="flex min-h-screen flex-col">
      <AccessDeniedHeader />
      <main className="flex flex-1 flex-col items-start gap-4 bg-[#d5d7dc] p-10">
        <section className="flex w-[680px] max-w-full flex-col items-start gap-3.5 border border-line-strong bg-card p-10">
          <span className="flex size-[52px] items-center justify-center bg-[#ececec] text-[#444]">
            <Icon name="lock" size={26} strokeWidth={1.75} />
          </span>
          <h1 className="text-2xl font-light">You do not have access to this mailbox</h1>
          <p className="text-sm leading-[1.6] text-ink-2">
            Mailbox Agent is only open to people who have access to ai@schindler.com. Your role comes from your security
            group. Ask the Platform Owner to add you to the access group.
          </p>
          <p className="text-[12.5px] text-ink-muted">Signed in as {email}</p>
        </section>

        <DemoUserSwitch />
      </main>
    </div>
  );
}
