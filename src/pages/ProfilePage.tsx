import { ArrowRight, AtSign, Calendar, Globe, Link2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useLocation, type LoaderFunctionArgs } from "react-router-dom";

import { AccessRequestModal } from "@/components/AccessRequestModal";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ContactForm } from "@/components/ContactForm";
import { designer } from "@/data/designer";
import { getProjects } from "@/data/projects";

export async function profileLoader({ params }: LoaderFunctionArgs) {
  if (params.slug !== designer.slug) throw new Response("Not Found", { status: 404 });
  const projects = await getProjects();
  return { designer, projects };
}

export function ProfilePage() {
  const { designer, projects } = useLoaderData() as Awaited<ReturnType<typeof profileLoader>>;
  const [modalOpen, setModalOpen] = useState(false);
  const hasConfidential = projects.some((p) => p.status === "confidential");
  const { hash } = useLocation();

  // React Router ne scrolle pas automatiquement vers un #hash après une
  // navigation client-side (contrairement à un chargement de page classique) —
  // nécessaire pour le lien "Contacter" du catalogue (/${slug}#contact).
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <AuroraBackground />
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:px-16">
        {/* HERO — 01 */}
        <section className="mb-32 grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="hidden md:col-span-1 md:block">
            <span className="text-6xl font-medium text-primary/90">01</span>
            <div className="mt-2 h-px w-8 bg-on-primary/20" />
          </div>

          <div className="rounded-[32px] border border-white/10 bg-surface-container/30 p-8 backdrop-blur-sm md:col-span-7 md:p-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Designeuse produit
            </p>
            <h1 className="text-5xl font-medium leading-[1.1] text-on-surface md:text-6xl">
              {designer.fullName}
            </h1>
            <p className="mt-2 font-display-accent text-5xl italic leading-tight text-primary md:text-6xl">
              Précise
            </p>
            <p className="mt-8 max-w-md text-base font-light leading-relaxed text-on-surface">
              {designer.bio}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={`/${designer.slug}/projects`}
                aria-label={`Voir les projets de ${designer.fullName}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-8 py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              >
                Voir les projets
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <div className="flex gap-3">
                <a
                  href={designer.website}
                  aria-label={`Visiter le site web de ${designer.fullName}`}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-primary transition-colors hover:border-primary"
                >
                  <Globe aria-hidden="true" size={22} />
                </a>
                <a
                  href={`mailto:${designer.email}`}
                  aria-label="M'envoyer un e-mail"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-primary transition-colors hover:border-primary"
                >
                  <AtSign aria-hidden="true" size={22} />
                </a>
                <a
                  href={designer.linkedin}
                  aria-label="Ouvrir le profil LinkedIn"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-primary transition-colors hover:border-primary"
                >
                  <Link2 aria-hidden="true" size={22} />
                </a>
              </div>
            </div>

            {hasConfidential && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-3 rounded-full border border-primary px-6 py-3 text-primary transition-colors hover:bg-primary-container/10"
                >
                  <Lock aria-hidden="true" size={18} />
                  <span className="text-sm font-bold tracking-wider">
                    Accéder aux projets confidentiels
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center md:col-span-4 md:justify-end">
            <div className="relative w-full max-w-[360px]">
              <div className="aspect-square overflow-hidden rounded-[48px] border border-white/10">
                <img
                  src={designer.avatar}
                  alt={`Portrait professionnel de ${designer.fullName}`}
                  className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT & CALENDAR — 02 */}
        <section id="contact" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="hidden lg:col-span-1 lg:block">
            <span className="whitespace-nowrap text-6xl font-medium text-secondary/90">02</span>
            <div className="mt-2 h-px w-8 bg-secondary/20" />
          </div>

          {/* Contact form */}
          <div className="rounded-[32px] border border-white/10 bg-surface-container-low p-8 backdrop-blur-md lg:col-span-5 md:p-12">
            <h2 className="mb-8 text-4xl font-medium text-on-surface">Collaborons ensemble</h2>
            <ContactForm />
          </div>

          {/* Calendar widget */}
          <div className="flex min-h-[500px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-surface-container-low backdrop-blur-md lg:col-span-6">
            <div className="border-b border-white/5 p-8 md:p-12">
              <h2 className="mb-4 text-4xl font-medium text-on-surface">Réserver un créneau</h2>
              <p className="text-base leading-relaxed text-on-surface">
                Discutons de vos besoins lors d'un appel découverte de 15 minutes pour explorer
                votre vision.
              </p>
            </div>
            <div className="relative flex-grow bg-background/30">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-on-primary/10">
                  <Calendar aria-hidden="true" className="text-primary" size={36} />
                </div>
                <p className="mb-2 text-base text-on-surface">
                  Chargement du calendrier interactif…
                </p>
                <p className="text-xs text-on-surface-variant">
                  cal.com/<span className="text-primary">{designer.calUsername}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AccessRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
