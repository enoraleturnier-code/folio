/**
 * Style de lien texte unifié — évite la divergence entre les liens du site
 * (font-semibold + primary sur fond standard, gris clair dans une alerte,
 * soulignement au survol dans les deux cas).
 */
export function textLinkClass(variant: "default" | "alert" = "default"): string {
  return (
    "no-underline underline-offset-2 transition-colors hover:underline " +
    (variant === "alert"
      ? "text-on-surface-variant"
      : "font-semibold text-primary")
  );
}
