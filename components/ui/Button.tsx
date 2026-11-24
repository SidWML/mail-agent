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

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "border-brand bg-brand text-white",
  outline: "border-brand bg-card text-brand",
  neutral: "border-line-control bg-card text-ink",
  success: "border-ok bg-card text-ok-dark",
  danger: "border-line-control bg-card text-brand-dark",
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
