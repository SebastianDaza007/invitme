import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

const variants = {
  accent:
    "bg-gradient-warm text-on-accent shadow-[0_10px_24px_-8px_rgb(227_108_20/0.5)] hover:brightness-[1.05]",
  primary:
    "bg-primary text-on-primary shadow-[0_10px_24px_-8px_rgb(227_108_20/0.45)] hover:bg-[#c75e10]",
  glass:
    "border border-white/70 bg-white/60 text-foreground backdrop-blur-md hover:bg-white/85",
  ghost: "text-muted-foreground hover:bg-black/5 hover:text-foreground",
} as const;

const sizes = {
  default: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
  icon: "size-11 p-0",
} as const;

export function buttonClasses({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold",
    "transition-all duration-200 ease-out active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  variant = "primary",
  size = "default",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        buttonClasses({ variant, size }),
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
