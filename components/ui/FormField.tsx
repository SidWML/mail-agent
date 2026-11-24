import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlClassName =
  "w-full border border-line-control bg-card px-3 text-sm outline-none transition-colors duration-150 ease-out placeholder:text-ink-faint focus:border-brand";

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Small grey text under the control. */
  hint?: string;
  children: ReactNode;
}

/** Label (with a red star when required), the control, and an optional hint. */
export default function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">
        {label}
        {required && <span className="ml-0.5 text-brand"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClassName, "h-10", className)} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClassName, "min-h-[64px] resize-y py-2.5", className)} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlClassName, "h-10", className)} />;
}
