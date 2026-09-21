// src/components/NotificationsButton.jsx
// Bouton « cloche » + panneau latéral des notifications.
// L'apparence du bouton est laissée à l'appelant via `renderTrigger` (sidebar, barre du haut...).
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LottieLoader from "./lottie/LottieLoader";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, X, Briefcase, FileText, Wallet, CalendarCheck } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../services/notifications";

const POLL_INTERVAL_MS = 60000;

const ICONS = {
  application_status: Briefcase,
  new_application: Briefcase,
  contract_received: FileText,
  payslip_approved: Wallet,
  absence_approved: CalendarCheck,
};

// Page à ouvrir quand on clique sur une notification
const targetFor = (n) => {
  if (n.type === "new_application") return "/jobs/candidates";
  if (n.type === "application_status") return "/jobs/my-applications";
  if (n.type === "contract_received" && n.data?.contract_id) return `/contracts/view/${n.data.contract_id}`;
  return null;
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 7 * 86400) return `il y a ${Math.floor(seconds / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
};

export default function NotificationsButton({ renderTrigger }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (!mounted.current) return;
      if (res.success) {
        setItems(res.notifications);
        setUnread(res.unread_count);
        setError("");
      } else if (res.status !== 401) {
        setError(res.error || "Impossible de charger les notifications.");
      }
    } catch {
      if (mounted.current) setError("Impossible de joindre le serveur.");
    }
  }, []);

  // Compteur toujours à jour : premier chargement puis rafraîchissement périodique
  useEffect(() => {
    mounted.current = true;
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  const openPanel = async () => {
    setOpen(true);
    setLoading(true);
    await refresh();
    setLoading(false);
  };

  const handleClick = async (n) => {
    if (!n.read) {
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
      markNotificationRead(n.id).catch(() => {});
    }
    const target = targetFor(n);
    if (target) {
      setOpen(false);
      navigate(target);
    }
  };

  const handleMarkAll = async () => {
    setItems((list) => list.map((x) => ({ ...x, read: true })));
    setUnread(0);
    await markAllNotificationsRead().catch(() => {});
  };

  const handleDelete = async (e, n) => {
    e.stopPropagation();
    setItems((list) => list.filter((x) => x.id !== n.id));
    if (!n.read) setUnread((c) => Math.max(0, c - 1));
    await deleteNotification(n.id).catch(() => {});
  };

  return (
    <>
      {renderTrigger({ onClick: openPanel, unread })}

      {/* Rendu dans <body> : un parent avec transform (menu latéral mobile) casserait le position: fixed */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Notifications">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unread > 0 && (
                  <span className="text-xs font-semibold bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                    {unread} non lue{unread > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {unread > 0 && (
              <div className="px-5 py-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading && items.length === 0 ? (
                <LottieLoader label="Chargement..." size={72} className="py-10" />
              ) : error ? (
                <p className="p-8 text-center text-red-600">{error}</p>
              ) : items.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-700">Aucune notification</p>
                  <p className="text-sm mt-1">Vous serez prévenu ici des candidatures, contrats et décisions.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((n) => {
                    const Icon = ICONS[n.type] || Bell;
                    return (
                      <li key={n.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleClick(n)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick(n)}
                          className={`flex gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 ${n.read ? "" : "bg-purple-50/60"}`}
                        >
                          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm ${n.read ? "text-gray-800" : "font-semibold text-gray-900"}`}>{n.title}</p>
                            <p className="text-sm text-gray-600 mt-0.5 break-words">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.read && <span className="mt-2 w-2 h-2 flex-shrink-0 rounded-full bg-red-500" aria-label="Non lue" />}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, n)}
                            aria-label="Supprimer la notification"
                            className="p-1.5 self-start rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
