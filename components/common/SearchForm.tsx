import Icon from "@/components/ui/Icon";

interface SearchFormProps {
  /** Current search text. */
  value?: string;
  placeholder: string;
  /** Page the form sends to, for example "/inbox". */
  action: string;
  /** Other current query values, kept when searching. */
  keptFields: Array<[string, string]>;
}

/** A plain GET form: pressing Enter reloads the page with ?q=... */
export default function SearchForm({ value, placeholder, action, keptFields }: SearchFormProps) {
  return (
    <form action={action} className="flex h-10 max-w-[270px] min-w-[200px] flex-1 items-center gap-2.5 border border-line-input bg-card px-3">
      {keptFields.map(([name, fieldValue]) => (
        <input key={`${name}-${fieldValue}`} type="hidden" name={name} value={fieldValue} />
      ))}
      <Icon name="search" size={16} className="text-ink-muted" />
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </form>
  );
}
