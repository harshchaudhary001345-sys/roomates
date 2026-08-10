import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bell, MessageSquare } from "lucide-react";
import { messages as messagesApi } from "../../lib/api";
import type { Conversation, Message } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

/** Bell + dropdown + toast for incoming messages. Realtime across all threads. */
export default function NotificationBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Message | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [count, inbox] = await Promise.all([
      messagesApi.unreadCount(user.id),
      messagesApi.inbox(user.id),
    ]);
    setUnread(count.data ?? 0);
    setThreads(inbox.data ?? []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refresh();

    // Live: bump the badge and surface a toast on every incoming message.
    const unsub = messagesApi.subscribeInbox(user.id, (msg) => {
      setUnread((n) => n + 1);
      setToast(msg);
      void refresh();
      window.setTimeout(() => setToast(null), 5000);
    });

    // Demo mode fires this after markRead so the badge stays in sync.
    const onRead = () => void refresh();
    window.addEventListener("demo-message-read", onRead);

    return () => {
      unsub();
      window.removeEventListener("demo-message-read", onRead);
    };
  }, [user, refresh]);

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            setOpen((v) => !v);
            void refresh();
          }}
          aria-label={`Messages${unread ? ` (${unread} unread)` : ""}`}
          className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-400 ring-1 ring-white/10 transition-colors hover:bg-white/8 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-[linear-gradient(135deg,#f43f5e,#7c3aed)] px-1 text-[10px] font-bold text-white ring-2 ring-[#05060c]"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass-strong absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]"
              >
                <div className="border-b border-white/8 px-4 py-3">
                  <p className="text-[13px] font-semibold text-white">Messages</p>
                  <p className="text-[11px] text-slate-500">
                    {unread > 0 ? `${unread} unread` : "You're all caught up"}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {threads.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[12.5px] text-slate-500">
                      No conversations yet.
                    </p>
                  ) : (
                    threads.map((t) => (
                      <Link
                        key={`${t.peerId}-${t.listingId}`}
                        to={t.listingId ? `/properties/${t.listingId}` : "/dashboard"}
                        onClick={() => setOpen(false)}
                        className="flex gap-3 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/6"
                      >
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[12px] font-bold text-white">
                          {t.peerName.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold text-white">
                              {t.peerName}
                            </span>
                            {t.unread > 0 && (
                              <span className="shrink-0 rounded-full bg-violet-500/25 px-1.5 py-0.5 text-[10px] font-bold text-violet-200">
                                {t.unread}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-slate-500">
                            {t.listingTitle}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block truncate text-[12px]",
                              t.unread > 0 ? "font-medium text-slate-200" : "text-slate-500",
                            )}
                          >
                            {t.lastText}
                          </span>
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Toast for a brand-new message */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass-strong fixed right-4 bottom-4 z-[60] flex max-w-sm items-start gap-3 rounded-2xl p-4 shadow-[0_25px_70px_-25px_rgba(0,0,0,0.95)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/25">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">New message</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] text-slate-400">{toast.text}</p>
              {toast.listing_id && (
                <Link
                  to={`/properties/${toast.listing_id}`}
                  onClick={() => setToast(null)}
                  className="mt-2 inline-block text-[12px] font-semibold text-violet-300 hover:text-violet-200"
                >
                  Open conversation →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
