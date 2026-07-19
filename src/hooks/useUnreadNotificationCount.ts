import { useEffect, useState } from "react";

import { getMyNotifications } from "@/data/notifications";
import { useAuth } from "@/hooks/useAuth";

/** Compte de notifications non lues, partagé entre l'avatar mobile (Header.tsx) et la
 * ligne "Notifications" de MobileAccountSheet -- même donnée que NotificationBell (desktop),
 * récupérée indépendamment ici pour ne pas coupler les deux composants entre eux. */
export function useUnreadNotificationCount(): number {
  const { session } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!session) {
      setCount(0);
      return;
    }
    getMyNotifications()
      .then((items) => setCount(items.filter((n) => !n.readAt).length))
      .catch(() => setCount(0));
  }, [session]);

  return count;
}
