interface CalEmbedProps {
  calUsername: string;
}

export function CalEmbed({ calUsername }: CalEmbedProps) {
  if (!calUsername) return null;
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-surface-container-low p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-on-primary/10">
        <span aria-hidden="true" className="material-symbols-outlined text-primary">
          calendar_month
        </span>
      </div>
      <h3 className="mt-4 text-lg font-medium text-on-surface">
        Calendrier — Prendre un rendez-vous
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant">
        Cette fonctionnalité sera connectée à Cal.com à l'étape suivante.
      </p>
      <p className="mt-3 text-xs text-on-surface-variant/70">
        Handle prévu : <span className="font-medium text-primary">cal.com/{calUsername}</span>
      </p>
    </div>
  );
}
