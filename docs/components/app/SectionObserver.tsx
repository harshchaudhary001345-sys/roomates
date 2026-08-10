import { useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Wraps a landing section in an IntersectionObserver.
 * The section's content only renders once it's within ~60% of the viewport,
 * reducing JavaScript parse time and keeping the 3D hero running at 60 fps.
 */
export default function SectionObserver({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const obsRef = useRef<IntersectionObserver | null>(null);

  function onRef(node: HTMLDivElement | null) {
    // Already fired — nothing to do.
    if (!node || visible) return;

    // Tear down any previous observer.
    obsRef.current?.disconnect();

    try {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        {
          // Use 3 valid numeric values so the browser never rejects rootMargin:
          // top: 0px (edge of viewport), right/left: 0px, bottom: 300px
          // (fires ~300px before the section scrolls into view).
          rootMargin: "0px 0px 300px 0px",
        } satisfies IntersectionObserverInit,
      );
      obsRef.current = obs;
      obs.observe(node);
    } catch {
      // If IntersectionObserver fails entirely (very old browser or restricted
      // context like some test runners), render everything immediately.
      setVisible(true);
    }
  }

  return (
    <div ref={onRef} className={className}>
      {visible ? (
        children
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          className="min-h-[30vh]"
          aria-hidden
        />
      )}
    </div>
  );
}
