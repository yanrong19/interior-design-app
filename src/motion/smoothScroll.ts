import { useEffect } from 'react';
import Lenis from 'lenis';

/** The one active Lenis instance, so overlays can pause scrolling and links can scroll smoothly. */
let current: Lenis | null = null;

export const getLenis = () => current;

export function stopScroll() { current?.stop(); }
export function startScroll() { current?.start(); }

export function scrollToY(y: number) {
  if (current) current.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Weighted smooth scrolling for reading pages. Off when the visitor prefers reduced motion.
 * Pass a wrapper element to smooth an inner scroll container (the app sheet) instead of the window.
 */
export function useSmoothScroll(getWrapper?: () => HTMLElement | null, deps: unknown[] = []) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrapper = getWrapper?.() ?? null;
    // An inner container only needs Lenis while it is the thing that scrolls (desktop sheet).
    if (wrapper && getComputedStyle(wrapper).overflowY !== 'auto') return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      ...(wrapper ? { wrapper, content: wrapper.firstElementChild as HTMLElement } : {}),
    });
    current = lenis;
    return () => {
      lenis.destroy();
      if (current === lenis) current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
