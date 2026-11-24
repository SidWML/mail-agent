import Link from "next/link";
import { approveCategorySuggestion } from "@/actions/categories";
import ActionFields from "@/components/common/ActionFields";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { CategorySuggestion } from "@/services/categories";

interface CategorySuggestionsProps {
  suggestions: CategorySuggestion[];
  /** Address to come back to after approving. */
  returnTo: string;
}

/** AI-09: when many mails land in "Needs review", the AI proposes a category. Nothing is created until the Owner approves. */
export default function CategorySuggestions({ suggestions, returnTo }: CategorySuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <section className="shrink-0 border border-[#f2d98a] bg-[#fff8e1]">
      <div className="flex items-center gap-2.5 px-5 py-3">
        <Icon name="sparkles" size={15} filled className="text-brand" />
        <div>
          <h2 className="text-[14px] font-semibold">The AI suggests {suggestions.length === 1 ? "a new category" : `${suggestions.length} new categories`}</h2>
          <p className="text-[12.5px] text-ink-3">Mails that keep landing in “Needs review” share a topic. Approve it to add the category and move those mails.</p>
        </div>
      </div>
      {suggestions.map((suggestion) => (
        <form key={suggestion.name} action={approveCategorySuggestion} className="flex flex-wrap items-center gap-4 border-t border-[#f2d98a] px-5 py-3">
          <ActionFields returnTo={returnTo} />
          <input type="hidden" name="name" value={suggestion.name} />
          <input type="hidden" name="typical" value={suggestion.typical} />
          <input type="hidden" name="mailIds" value={suggestion.mailIds.join(",")} />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold">
              {suggestion.name}
              <span className="ml-2 bg-card px-2 py-0.5 text-xs font-semibold text-ink-3">{suggestion.count} {suggestion.count === 1 ? "mail" : "mails"}</span>
            </p>
            <p className="truncate text-[12.5px] text-ink-3">{suggestion.typical}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
              {suggestion.examples.map((example) => (
                <Link key={example.id} href={`/inbox?tab=all&mail=${example.id}`} className="font-semibold text-brand">
                  Open example: {example.subject.slice(0, 40)}
                </Link>
              ))}
            </p>
          </div>
          <Button type="submit" variant="primary" large>
            Approve and add
          </Button>
        </form>
      ))}
    </section>
  );
}
