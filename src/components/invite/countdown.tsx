"use client";

import { PartyPopper } from "lucide-react";
import { useCountdown } from "@/src/hooks/use-countdown";

interface CountdownProps {
  target: Date;
}

export function Countdown({ target }: CountdownProps) {
  const parts = useCountdown(target);

  if (parts?.terminado) {
    return (
      <section className="border-y border-primary/10 bg-white/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center sm:px-6">
          <PartyPopper className="size-8 text-accent" aria-hidden />
          <h2 className="font-display text-3xl font-semibold italic text-foreground">
            ¡Es hoy!
          </h2>
          <p className="text-sm text-muted-foreground">
            El evento ya comenzó, te esperamos.
          </p>
        </div>
      </section>
    );
  }

  const items = [
    { label: "Días", value: parts?.dias },
    { label: "Horas", value: parts?.horas },
    { label: "Min", value: parts?.minutos },
    { label: "Seg", value: parts?.segundos },
  ];

  return (
    <section
      aria-label="Cuenta regresiva para el evento"
      className="border-y border-primary/10 bg-white/40"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:justify-between lg:gap-10">
        <h2 className="shrink-0 text-center lg:text-left">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Cuenta regresiva
          </span>
          <span className="mt-1 block font-display text-2xl font-semibold italic text-foreground sm:text-3xl">
            Falta poco
          </span>
        </h2>

        <div className="grid w-full max-w-md grid-cols-4 divide-x divide-primary/10 lg:w-auto lg:max-w-none">
          {items.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center px-2 sm:px-5 lg:px-8"
            >
              <span className="font-display text-4xl font-semibold tabular-nums leading-none text-foreground sm:text-5xl lg:text-6xl">
                {value === undefined ? "--" : String(value).padStart(2, "0")}
              </span>
              <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
