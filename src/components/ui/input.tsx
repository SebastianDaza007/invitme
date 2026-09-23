import type { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-white/70 px-4 text-[15px] text-foreground",
        "placeholder:text-muted-foreground/70",
        "transition-shadow duration-200",
        "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}
