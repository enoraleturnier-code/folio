export function DesignerHeroSkeleton() {
  return (
    <section className="mb-32 grid grid-cols-1 items-center gap-6 md:grid-cols-12">
      <div className="hidden md:col-span-1 md:block">
        <div className="h-14 w-14 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="rounded-[32px] border border-white/10 bg-surface-container/30 p-8 backdrop-blur-sm md:col-span-7 md:p-12">
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-white/10" />
        <div className="mt-10 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-white/5" />
        </div>
        <div className="mt-10 flex gap-3">
          <div className="h-12 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
          <div className="h-12 w-12 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
      <div className="flex justify-center md:col-span-4 md:justify-end">
        <div className="aspect-square w-full max-w-[360px] animate-pulse rounded-[48px] bg-white/5" />
      </div>
    </section>
  );
}

export function DesignerInlineSkeleton({ width = "w-24" }: { width?: string }) {
  return <span className={`inline-block h-4 animate-pulse rounded bg-white/10 ${width}`} />;
}
