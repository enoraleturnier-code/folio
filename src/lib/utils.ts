import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** La regle CSS globale @media (prefers-reduced-motion: reduce) (styles.css) neutralise
 * les transitions/animations CSS mais pas les options behavior:"smooth" de scrollTo/
 * scrollIntoView, qui restent a verifier explicitement cote JS. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
