import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { RevealText } from '../motion/Reveal';
import { scrollToY } from '../motion/smoothScroll';
import { photos, unsplash } from '../data/images';
import s from './HeroSequence.module.css';

/* Four rooms the hero moves through. Inspiration photos, captioned with what to learn from each. */
const rooms = [
  { id: photos.livingLounge, alt: 'A long living room with a grey sofa, a low timber coffee table and a strip window', title: 'The long living room', meta: 'Japandi · sofa to table 45 cm' },
  { id: photos.livingBoucle, alt: 'A pale living room with a bouclé sofa, round mirrors and a low round table', title: 'Round forms, low seats', meta: 'Japandi · seats under 42 cm' },
  { id: photos.diningGreen, alt: 'A dining room with green velvet chairs around a white table under a globe pendant', title: 'Velvet at the table', meta: 'Mid-century · 75 cm behind each chair' },
  { id: photos.loftLiving, alt: 'A brick loft with a grey sofa, leather chairs and a rug marking the seating zone', title: 'A loft in zones', meta: 'Industrial · 90 cm between zones' },
];

const ease = [0.16, 1, 0.3, 1] as const;

/** Deterministic shuffle so the tile order is the same on every visit. */
function shuffledOrder(n: number, seed = 7) {
  const a = Array.from({ length: n }, (_, i) => i);
  let x = seed;
  for (let i = n - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const rank = new Array(n);
  a.forEach((cell, k) => (rank[cell] = k / n));
  return rank as number[];
}

/** Image size matched to the stage's aspect, rounded so resizing does not refetch constantly. */
function useStageImage(el: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(2400, Math.ceil((width * dpr) / 400) * 400);
      const aspect = Math.round((width / height) * 20) / 20;
      setSize((prev) => (prev.w === w && Math.abs(prev.w / prev.h - aspect) < 0.01 ? prev : { w, h: Math.round(w / aspect) }));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [el]);
  return (id: string) => unsplash(id, size.w, size.h);
}

export function HeroSequence() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const src = useStageImage(stage);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const cols = narrow ? 4 : 8;
  const rows = narrow ? 7 : 5;
  const order = useMemo(() => shuffledOrder(cols * rows), [cols, rows]);

  const [current, setCurrent] = useState(0); // the room fully shown underneath
  const [active, setActive] = useState(0); // the room named in the caption
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });

  // Scroll drives one CSS variable (--t, the transition into the next room) and --s (overall position).
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (reduce) return;
    const sPos = p * (rooms.length - 1);
    let base = Math.floor(sPos);
    let t = Math.min(1, Math.max(0, (sPos - base - 0.15) / 0.7));
    if (base >= rooms.length - 1) { base = rooms.length - 1; t = 0; }
    stage.current?.style.setProperty('--t', t.toFixed(4));
    section.current?.style.setProperty('--s', sPos.toFixed(4));
    if (base !== current) setCurrent(base);
    const named = t > 0.5 ? base + 1 : base;
    if (named !== active) setActive(named);
  });

  // Preload every room so the tiles never flip to an empty square.
  useEffect(() => {
    rooms.forEach((r) => { const img = new Image(); img.src = src(r.id); });
  }, [src]);

  const goTo = (i: number) => {
    if (reduce) { setCurrent(i); setActive(i); return; }
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    // Land just after the transition into room i has finished.
    const target = i === 0 ? 0 : Math.min(1, (i - 0.1) / (rooms.length - 1));
    scrollToY(top + travel * target);
  };

  const next = rooms[current + 1];

  return (
    <section
      ref={section}
      className={`${s.section} ${reduce ? s.still : ''}`}
      style={{ '--rooms': rooms.length } as React.CSSProperties}
      aria-labelledby="hero-title"
    >
      <div className={s.sticky}>
        <motion.div
          ref={stage}
          className={s.stage}
          initial={reduce ? false : { clipPath: 'inset(18% 12% 18% 12%)', scale: 1.08 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
          transition={{ duration: 1.6, ease }}
        >
          {reduce ? (
            rooms.map((r, i) => (
              <div key={r.id} className={s.layer} style={{ backgroundImage: `url(${src(r.id)})`, opacity: i === current ? 1 : 0 }} role="img" aria-label={i === current ? r.alt : undefined} />
            ))
          ) : (
            <>
              <div className={s.layer} style={{ backgroundImage: `url(${src(rooms[current].id)})` }} role="img" aria-label={rooms[active].alt} />
              {next && (
                <div className={s.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
                  {order.map((o, i) => {
                    const x = i % cols, y = Math.floor(i / cols);
                    return (
                      <div
                        key={`${current}-${i}`}
                        className={s.cell}
                        style={{
                          '--o': (o * 0.72).toFixed(3),
                          backgroundImage: `url(${src(next.id)})`,
                          backgroundSize: `${cols * 100}% ${rows * 100}%`,
                          backgroundPosition: `${(x / (cols - 1)) * 100}% ${(y / (rows - 1)) * 100}%`,
                        } as React.CSSProperties}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
          <div className={s.scrim} aria-hidden="true" />
        </motion.div>

        {/* After the first room the headline steps aside and each room names itself, large. */}
        {!reduce && (
          <div className={s.roomTitle} aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              {active > 0 && (
                <motion.div key={active} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6, ease }}>
                  <p className={`display ${s.roomName}`}><em>{rooms[active].title}</em></p>
                  <p className={s.roomMeta}>{rooms[active].meta}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className={`${s.content} ${active > 0 && !reduce ? s.contentAway : ''}`}>
          <RevealText as="h1" id="hero-title" className={`display ${s.title}`} lines={['Plan the room', 'you live in.']} italic={[1]} onLoad delay={0.7} />
          <motion.p className={s.lead} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.2 }}>
            Learn the rules of a room, find pieces that fit them, and check your layout on your own floor plan.
          </motion.p>
          <motion.div className={s.actions} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.35 }}>
            <Link to="/planner" className={s.primary}>Open the planner</Link>
            <Link to="/knowledge?a=living-room" className={s.secondary}>Read the room rules</Link>
          </motion.div>
        </div>

        <motion.div className={s.foot} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.6 }}>
          <div className={s.caption} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}>
                <p className={`display ${s.captionTitle}`}><em>{rooms[active].title}</em></p>
                <p className={s.captionMeta}>{rooms[active].meta}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={s.bars} role="group" aria-label="Rooms">
            {rooms.map((r, i) => (
              <button
                key={r.id}
                className={s.bar}
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => goTo(i)}
                aria-label={`Show ${r.title}`}
                aria-current={active === i ? 'true' : undefined}
              >
                <span className={s.barFill} />
              </button>
            ))}
          </div>
          {!reduce && <p className={s.hint} aria-hidden="true">Scroll to walk through</p>}
        </motion.div>
      </div>
    </section>
  );
}
