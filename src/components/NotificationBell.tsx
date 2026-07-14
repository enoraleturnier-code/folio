import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { IconTooltip } from "@/components/IconTooltip";
import { designer } from "@/data/designer";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/data/notifications";
import { useAuth } from "@/hooks/useAuth";

const TYPE_LABELS: Record<AppNotification["type"], string> = {
  access_request_received: "Nouvelles demandes",
  access_request_resolved: "Demandes traitées",
};

/** Libellé de la notification -- pour une demande traitée, distingue accordé/refusé via le statut joint. */
function notificationLabel(n: AppNotification): string {
  if (n.type === "access_request_received") {
    return `Nouvelle demande d'accès${n.projectTitle ? ` — ${n.projectTitle}` : ""}`;
  }
  const outcome = n.accessRequestStatus === "rejected" ? "refusé" : "accordé";
  return `Accès ${outcome}${n.projectTitle ? ` — ${n.projectTitle}` : ""}`;
}

/** Cloche de notifications partagée admin/visiteur -- même composant, contenu filtré par RLS selon qui est connecté. */
export function NotificationBell() {
  const { session, role } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      setItems([]);
      return;
    }
    getMyNotifications()
      .then(setItems)
      .catch(() => setItems([]));
  }, [session]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session) return null;

  const unreadCount = items.filter((n) => !n.readAt).length;

  const groups = items.reduce<Record<string, AppNotification[]>>((acc, n) => {
    (acc[n.type] ??= []).push(n);
    return acc;
  }, {});

  const handleClick = (n: AppNotification) => {
    setOpen(false);
    if (!n.readAt) {
      markNotificationRead(n.id).catch(() => {
        /* le badge se resynchronisera au prochain fetch */
      });
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
      );
    }
    if (n.type === "access_request_received") {
      navigate("/admin?tab=demandes");
    } else if (n.projectId) {
      navigate(`/${designer.slug}/projects?notif=${n.projectId}`);
    }
  };

  const footerHref = role === "admin" ? "/admin" : `/${designer.slug}/projects`;
  const footerLabel = role === "admin" ? "Voir le dashboard" : "Voir mes projets";

  return (
    <div className="relative" ref={ref}>
      <IconTooltip label="Notifications">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Notifications"
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface transition-all hover:bg-primary-container/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Bell aria-hidden="true" size={22} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </IconTooltip>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-[80] mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl"
        >
          {unreadCount > 0 && (
            <div className="flex justify-end border-b border-white/8 px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  const unreadIds = items.filter((n) => !n.readAt).map((n) => n.id);
                  markAllNotificationsRead(unreadIds).catch(() => {
                    /* le badge se resynchronisera au prochain fetch */
                  });
                  const now = new Date().toISOString();
                  setItems((prev) => prev.map((x) => (x.readAt ? x : { ...x, readAt: now })));
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
          <div className="max-h-96 overflow-y-auto py-2">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                Aucune notification
              </p>
            ) : (
              Object.entries(groups).map(([type, group]) => (
                <div key={type} className="px-2 py-1">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                    {TYPE_LABELS[type as AppNotification["type"]]}
                  </p>
                  {group.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleClick(n)}
                      className={
                        "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 " +
                        (n.readAt ? "text-on-surface-variant" : "text-on-surface")
                      }
                    >
                      <span className="font-medium">{notificationLabel(n)}</span>
                      <span className="text-xs text-on-surface-variant/70">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
          <Link
            to={footerHref}
            onClick={() => setOpen(false)}
            className="block border-t border-white/8 px-4 py-3 text-center text-sm font-medium text-primary hover:bg-white/5"
          >
            {footerLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
