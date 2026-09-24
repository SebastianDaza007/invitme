import Image from "next/image";
import { cn } from "@/src/lib/utils";

const WORDMARK_RATIO = 2022.97 / 477.57;
const MARK_RATIO = 1; // el imagotipo oficial viene en lienzo cuadrado 240×240

export function Logo({
  variant = "wordmark",
  height = 28,
  className,
}: {
  /** `wordmark`: "invitme" completo. `mark`: la "i" persona (isotipo). */
  variant?: "wordmark" | "mark";
  /** Alto renderizado en px; el ancho se deriva del aspect ratio real. */
  height?: number;
  className?: string;
}) {
  const isWordmark = variant === "wordmark";
  const ratio = isWordmark ? WORDMARK_RATIO : MARK_RATIO;
  return (
    <Image
      src={isWordmark ? "/invitme-logo.svg" : "/invitme-mark.svg"}
      alt="Invitme"
      width={Math.round(height * ratio)}
      height={height}
      unoptimized
      loading="eager"
      className={cn("w-auto", className)}
      style={{ height }}
    />
  );
}
