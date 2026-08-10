import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { messages } from "../../lib/api";
import type { Message, Profile } from "../../lib/types";
import { Alert, inputCls } from "./Shell";
import { cn } from "../../utils/cn";

export default function ChatBox({
  currentUser,
  ownerId,
  listingId,
}: {
  currentUser: Profile | null;
  ownerId: string;
  listingId: string;
}) {
  const [items, setItems] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    let alive = true;
    (async () => {
      const res = await messages.list(currentUser.id, ownerId, listingId);
      if (!alive) return;
      if (res.error) setError(res.error);
      else setItems(res.data ?? []);
      // Opening the thread clears its unread badge.
      await messages.markRead(currentUser.id, ownerId, listingId);
    })();
    const unsub = messages.subscribe(listingId, (msg) => {
      const related =
        msg.listing_id === listingId &&
        ((msg.sender_id === currentUser.id && msg.receiver_id === ownerId) ||
          (msg.sender_id === ownerId && msg.receiver_id === currentUser.id));
      if (related) {
        setItems((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        // Thread is on screen, so treat inbound messages as read straight away.
        if (msg.receiver_id === currentUser.id) {
          void messages.markRead(currentUser.id, ownerId, listingId);
        }
      }
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [currentUser, ownerId, listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return setError("Log in to chat with the owner.");
    setLoading(true);
    setError(null);
    const res = await messages.send({
      sender_id: currentUser.id,
      receiver_id: ownerId,
      listing_id: listingId,
      text,
    });
    setLoading(false);
    if (res.error) return setError(res.error);
    setText("");
    if (res.data) setItems((prev) => (prev.some((m) => m.id === res.data!.id) ? prev : [...prev, res.data!]));
  }

  return (
    <div className="glass mt-8 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-cyan-300" />
        <h3 className="text-[15px] font-semibold text-white">Chat with owner</h3>
      </div>
      {error && <div className="mt-4"><Alert kind="error">{error}</Alert></div>}
      <div className="mt-4 max-h-72 overflow-y-auto rounded-xl bg-black/20 p-3 ring-1 ring-white/8">
        {items.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-slate-500">
            No messages yet. Send the first question about this home.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((m) => {
              const mine = m.sender_id === currentUser?.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                      mine
                        ? "bg-[linear-gradient(100deg,#7c3aed,#0891b2)] text-white"
                        : "bg-white/8 text-slate-200 ring-1 ring-white/8",
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={currentUser ? "Ask about deposit, parking, water..." : "Log in to chat"}
          disabled={!currentUser || loading}
          className={inputCls}
        />
        <button
          disabled={!currentUser || loading || !text.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] text-white disabled:opacity-50"
          aria-label="Send message"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
