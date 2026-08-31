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

/** Selecteur des elements focusables au clavier -- utilise pour le piege a
 * focus des dialogs modaux (AccessRequestModal, SlideSheet). */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Anneau de focus de marque -- avant cette extraction, cette meme chaine
 * etait recopiee en dur dans une dizaine de composants (Header, ProfilePage,
 * ScrollToTopButton, ProjectCard...). A composer avec cn(). */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
