import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Words rise out of a mask when the heading enters the viewport.
 * `lines` lets a heading break where the copy wants; `italic` marks lines set in italic.
 */
export function RevealText({
  as: Tag = 'h2',
  lines,
  className,
  italic = [],
  delay = 0,
  onLoad = false,
  id,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  lines: string[];
  className?: string;
  italic?: number[];
  delay?: number;
  /** animate on mount instead of on scroll (first screen) */
  onLoad?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const reduce = useReducedMotion();
  const show = onLoad || inView;
  let w = 0;
  return (
    <Tag ref={ref} className={className} id={id} aria-label={lines.join(' ')}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true" style={{ display: 'block' }}>
          {line.split(' ').map((word, wi) => {
            const i = w++;
            const inner = italic.includes(li) ? <em>{word}</em> : word;
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
                <motion.span
                  style={{ display: 'inline-block' }}
                  initial={reduce ? false : { y: '105%' }}
                  animate={show ? { y: '0%' } : undefined}
                  transition={{ duration: 0.9, ease, delay: delay + i * 0.06 }}
                >
                  {inner}
                </motion.span>
                {wi < line.split(' ').length - 1 ? ' ' : null}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/** A picture that opens with a wipe and settles from a slight zoom as it enters the viewport. */
export function RevealImage({ children, className, from = 'bottom' }: { children: React.ReactNode; className?: string; from?: 'bottom' | 'left' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const hidden = from === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: hidden }}
      animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      transition={{ duration: 1.2, ease }}
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        style={{ width: '100%', height: '100%' }}
        initial={{ scale: 1.18 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: 1.6, ease }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Moves its content a little against the scroll, for depth. `amount` is a percentage of its height. */
export function Parallax({ children, amount = 8, className }: { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y: reduce ? 0 : y, height: `${100 + amount * 2}%`, marginTop: `-${amount}%` }}>{children}</motion.div>
    </div>
  );
}

/** Counts up to an integer the first time it is seen; anything else (2/3, 1.5×) prints as is. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const target = /^\d+$/.test(value) ? parseInt(value, 10) : null;
  const [shown, setShown] = useState(target === null || reduce ? value : '0');
  useEffect(() => {
    if (!inView || target === null || reduce) return;
    const c = animate(0, target, { duration: 1.4, ease, onUpdate: (v) => setShown(String(Math.round(v))) });
    return () => c.stop();
  }, [inView, target, reduce]);
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
