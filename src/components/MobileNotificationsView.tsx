import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { designer } from "@/data/designer";
import {
  getMyNotifications,
  markNotificationRead,
  notificationLabel,
  type AppNotification,
} from "@/data/notifications";

/** Vue "Notifications" en drill-in dans la feuille compte mobile -- branchée sur
 * la table `notifications` existante (RLS notifications_select_own), pas de
 * liste dérivée. Admin : demandes reçues → dashboard. Visiteur : demandes
 * résolues → fiche projet. */
export function MobileNotificationsView({
  isAdmin,
  onBack,
  onNavigated,
}: {
  isAdmin: boolean;
  onBack: () => void;
  onNavigated: () => void;
}) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyNotifications()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const relevant = items
    .filter((n) => (isAdmin ? n.type === "access_request_received" : n.type === "access_request_resolved"))
    .sort((a, b) => {
      if (Boolean(a.readAt) !== Boolean(b.readAt)) return a.readAt ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });

  const handleAction = (n: AppNotification) => {
    if (!n.readAt) {
      markNotificationRead(n.id).catch(() => {
        /* le badge se resynchronisera au prochain fetch */
      });
    }
    if (isAdmin) {
      navigate("/admin?tab=demandes");
    } else if (n.projectId) {
      navigate(`/${designer.slug}/projects?notif=${n.projectId}`);
    }
    onNavigated();
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour au menu compte"
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <h2 className="text-xl font-medium text-on-surface">Notifications</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Chargement…</p>
        ) : relevant.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Inbox aria-hidden="true" className="text-on-surface-variant/40" size={48} />
            <p className="text-sm font-light text-on-surface-variant">Aucune notification</p>
          </div>
        ) : (
          <ul role="list" className="space-y-3">
            {relevant.map((n) => (
              <li
                key={n.id}
                className={
                  "flex flex-col gap-3 rounded-2xl border p-4 " +
                  (n.readAt
                    ? "border-white/5 bg-surface-container-low"
                    : "border-primary/20 bg-primary-container/5")
                }
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{notificationLabel(n)}</p>
                  <p className="mt-1 text-[10px] tracking-widest text-on-surface-variant">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(n)}
                  className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {isAdmin ? "Accéder au dashboard" : "Voir le projet"}
                  <ArrowRight aria-hidden="true" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
