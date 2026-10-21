import { motion, useScroll, useSpring } from 'motion/react';

/** A thin line across the top that fills as you read. Pass a container when the page scrolls inside one. */
export function ScrollProgress({ container, tone = 'accent' }: { container?: React.RefObject<HTMLElement>; tone?: 'accent' | 'ink' }) {
  const { scrollYProgress } = useScroll(container ? { container } : undefined);
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 60,
        transformOrigin: '0 50%',
        scaleX,
        background: tone === 'accent' ? 'var(--accent)' : 'var(--ink)',
        pointerEvents: 'none',
      }}
    />
  );
}
