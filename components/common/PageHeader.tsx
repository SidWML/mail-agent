interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="shrink-0">
      <h1 className="text-[30px] leading-[1.2] font-light tracking-[-0.01em]">{title}</h1>
      <p className="mt-1 text-sm text-ink-3">{subtitle}</p>
    </div>
  );
}
