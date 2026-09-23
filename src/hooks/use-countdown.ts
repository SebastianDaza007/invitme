"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  terminado: boolean;
}

function calcular(target: Date, now: number): CountdownParts {
  const diff = Math.max(0, target.getTime() - now);
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor(diff / 3_600_000) % 24,
    minutos: Math.floor(diff / 60_000) % 60,
    segundos: Math.floor(diff / 1_000) % 60,
    terminado: diff === 0,
  };
}

/**
 * Devuelve null hasta que el componente monta en el cliente,
 * evitando hydration mismatch con el render del servidor.
 */
export function useCountdown(target: Date): CountdownParts | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Primer valor en el próximo frame (setState async, no en el body del effect).
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return now === null ? null : calcular(target, now);
}
