import type { ReactElement } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IconTooltipProps {
  label: string;
  children: ReactElement;
}

/** Enveloppe un bouton icone-seul avec un tooltip au hover -- reprend le libelle deja utilise pour aria-label. */
export function IconTooltip({ label, children }: IconTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
