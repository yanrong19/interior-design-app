import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Wordmark } from '../components/Mark';
import s from './SiteHeader.module.css';

/**
 * The Home header: transparent over the hero, a paper bar once past it.
 * Hides while you scroll down, comes back the moment you scroll up.
 */
export function SiteHeader({ heroEnd }: { heroEnd: () => number }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const end = heroEnd();
    setSolid(y > end - 72);
    // Over the pinned hero the header stays, so the rooms always have their way out.
    if (y < end - 72 || y < 120) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  return (
    <motion.header
      className={`${s.header} ${solid ? s.solid : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -88 : 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.05 }}
    >
      <Link to="/" className={s.brand} aria-label="Roomwright home"><Wordmark inverse={!solid} /></Link>
      <nav aria-label="Main" className={s.links}>
        <Link to="/knowledge">Knowledge base</Link>
        <Link to="/catalog">Catalog</Link>
      </nav>
      <Link to="/planner" className={s.cta}>Open the planner</Link>
    </motion.header>
  );
}
