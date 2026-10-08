import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial wheel scrolling for long-form pages (the landing page). Native scrolling is kept for
 * touch, keyboard and the scrollbar; the effect never starts when the visitor prefers reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // lerp 0.12: weighted and responsive, settles quickly instead of floating
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    return () => lenis.destroy();
  }, []);
}
