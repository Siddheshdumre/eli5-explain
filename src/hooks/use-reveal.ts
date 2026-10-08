import { useEffect, type RefObject } from "react";

/**
 * Entry reveals for elements marked `data-reveal` (slide up through a mask) or `data-reveal-rule`
 * (draw from the left). Only elements that start below the fold are armed, and nothing is armed
 * without IntersectionObserver or under reduced motion, so content is never hidden by default.
 */
export function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = root.current;
    if (!container || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const attrOf = (el: Element) => (el.hasAttribute("data-reveal-rule") ? "data-reveal-rule" : "data-reveal");
    const fold = window.innerHeight * 0.92;
    const targets = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-rule]")).filter(
      (el) => el.getBoundingClientRect().top > fold
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute(attrOf(entry.target), "in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    for (const el of targets) {
      el.setAttribute(attrOf(el), "armed");
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [root]);
}
