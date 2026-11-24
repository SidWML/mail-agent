import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "neutral"
  | "success"
  | "danger"
  | "dark"
  /** Solid green, for confirm buttons ("Mark as acted"). */
  | "successSolid"
  /** Solid dark red, for destructive confirm buttons ("Delete mail"). */
  | "dangerSolid";

/**
 * Button weight, strongest first (one solid red button per screen area is the next step):
 * primary  solid red        the one thing you most likely want to do
 * outline  red outline      a step that matters, but is not the only one (Take it in a long list)
 * neutral  white, grey line other choices (Assign, Forward, view)
 * success  soft green       finishing the mail (Mark as acted)
 * danger   quiet red text   cannot be undone easily: no border until you point at it, so it is never hit by mistake
 */
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "border-brand bg-brand text-white hover:border-brand-dark hover:bg-brand-dark",
  outline: "border-brand bg-card text-brand hover:bg-brand-tint",
  neutral: "border-line-control bg-card text-ink hover:border-ink-faint hover:bg-stripe",
  success: "border-[#b4dcc6] bg-ok-bg text-ok-dark hover:border-ok hover:bg-ok hover:text-white",
  danger: "border-transparent bg-transparent text-brand-dark shadow-none! hover:border-brand hover:bg-brand-tint",
  dark: "h-8 gap-[7px] border-bar-button-line bg-bar-button text-white",
  successSolid: "border-ok-dark bg-ok-dark text-white",
  dangerSolid: "border-brand-dark bg-brand-dark text-white",
};

interface ButtonStyleOptions {
  variant: ButtonVariant;
  /** Square 30px button with only an icon. */
  iconOnly?: boolean;
  /** 38px tall, used in dialogs and forms. */
  large?: boolean;
  className?: string;
}

export function getButtonClassName({ variant, iconOnly = false, large = false, className }: ButtonStyleOptions) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border text-[12.5px] font-semibold transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-150 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] active:scale-[0.97] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    large ? "h-[38px]" : "h-[30px]",
    iconOnly ? "w-[30px]" : large ? "px-5 text-[13px]" : "px-3",
    VARIANT_STYLES[variant],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconOnly?: boolean;
  large?: boolean;
}

export default function Button({ variant = "neutral", iconOnly, large, className, ...props }: ButtonProps) {
  return <button {...props} className={getButtonClassName({ variant, iconOnly, large, className })} />;
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  iconOnly?: boolean;
  large?: boolean;
  className?: string;
  title?: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant = "neutral", iconOnly, large, className, title, children }: ButtonLinkProps) {
  return (
    <Link href={href} title={title} aria-label={title} className={getButtonClassName({ variant, iconOnly, large, className })}>
      {children}
    </Link>
  );
}
