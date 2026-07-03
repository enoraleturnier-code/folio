import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { AccessRequestModal } from "@/components/AccessRequestModal";
import { AuroraBackground } from "@/components/AuroraBackground";
import { CalEmbed } from "@/components/CalEmbed";
import { ContactForm } from "@/components/ContactForm";
import { ProjectCard } from "@/components/ProjectCard";
import { designer } from "@/data/designer";
import { projects } from "@/data/projects";

export const Route = createFileRoute("/$slug/")({
  loader: ({ params }) => {
    if (params.slug !== designer.slug) throw notFound();
    return { designer };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const featured = projects
    .filter((p) => p.status !== "deleted" && p.status !== "draft")
    .slice(0, 3);
  const hasConfidential = projects.some(
    (p) => p.sensitivity === "confidentielle" && p.status !== "deleted",
  );

  return (
    <>
      <AuroraBackground />
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16">
        {/* HERO */}
        <section className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              01 — Portrait
            </p>
            <h1 className="text-5xl font-medium leading-[1.05] text-on-surface md:text-7xl">
              Vos meilleurs projets,{" "}
              <span className="font-display-accent italic text-primary">enfin</span> vus.
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant">
              {designer.bio}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/$slug/projects"
                params={{ slug: designer.slug }}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
              >
                Voir les projets publics
              </Link>
              {hasConfidential && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white hover:opacity-90"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    lock
                  </span>
                  Accéder aux projets confidentiels
                </button>
              )}
            </div>
          </div>
          <aside className="md:col-span-4">
            <div className="glass-card sticky top-28 rounded-2xl p-6">
              <img
                src={designer.avatar}
                alt={designer.fullName}
                className="h-20 w-20 rounded-full object-cover"
              />
              <p className="mt-4 text-lg font-medium text-on-surface">{designer.fullName}</p>
              <p className="text-sm text-on-surface-variant">{designer.headline}</p>
              <div className="mt-6 space-y-2 text-sm text-on-surface-variant">
                <p className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    place
                  </span>
                  {designer.location}
                </p>
                <p className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    mail
                  </span>
                  {designer.email}
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* FEATURED PROJECTS */}
        <section className="mt-32">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#A78BFA]">
                02 — Sélection
              </p>
              <h2 className="text-4xl font-medium text-on-surface md:text-5xl">
                Trois projets, trois{" "}
                <span className="font-display-accent italic text-primary">décisions</span>.
              </h2>
            </div>
            <Link
              to="/$slug/projects"
              params={{ slug: designer.slug }}
              className="hidden text-sm font-medium text-on-surface-variant hover:text-primary md:block"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onRequestAccess={() => setModalOpen(true)} />
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="mt-32 grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              03 — Contact
            </p>
            <h2 className="text-4xl font-medium text-on-surface md:text-5xl">
              Une conversation{" "}
              <span className="font-display-accent italic text-primary">précise</span> vaut mieux qu'un long brief.
            </h2>
            <p className="mt-6 text-base text-on-surface-variant">
              Réponse sous 48 heures ouvrées. Pour un premier échange, préférez le calendrier
              ci-contre — 30 minutes, agenda partagé.
            </p>
            <div className="mt-8">
              <CalEmbed calUsername={designer.calUsername} />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <ContactForm />
          </div>
        </section>
      </main>

      <AccessRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
