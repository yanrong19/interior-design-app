import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring } from 'motion/react';
import { designStyles } from '../data/styles';
import { formatPrice, productById } from '../data/catalog';
import { unsplash } from '../data/images';
import { Icon } from '../components/Icon';
import { RevealText } from '../motion/Reveal';
import { startScroll, stopScroll } from '../motion/smoothScroll';
import s from './RoomsGallery.module.css';

const items = designStyles.flatMap((st) =>
  st.inspiration.map((it) => ({ ...it, key: `${st.id}-${it.photo}`, styleId: st.id, styleName: st.name })),
);
type Item = (typeof items)[number];

const ease = [0.16, 1, 0.3, 1] as const;

/** Rooms from the style guides as a draggable strip; a card opens into a full view of its lessons. */
export function RoomsGallery() {
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<Item | null>(null);
  const strip = useRef<HTMLUListElement>(null);
  const shown = useMemo(() => items.filter((i) => filter === 'all' || i.styleId === filter), [filter]);

  const { scrollXProgress } = useScroll({ container: strip });
  const progress = useSpring(scrollXProgress, { stiffness: 160, damping: 30 });

  // Mouse drag to scroll the strip; touch and trackpads scroll it natively.
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !strip.current) return;
    drag.current = { down: true, x: e.clientX, left: strip.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || !strip.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    strip.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => { drag.current.down = false; };

  const page = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  useEffect(() => { strip.current?.scrollTo({ left: 0 }); }, [filter]);

  return (
    <section className={s.section} aria-labelledby="rooms-title">
      <div className={s.head}>
        <RevealText as="h2" id="rooms-title" className={`display ${s.title}`} lines={['Rooms to', 'learn from']} italic={[1]} />
        <div className={s.headSide}>
          <p className={s.lead}>{items.length} rooms across four styles. Open one to see the rules it follows and the pieces in it.</p>
          <div className={s.filters} role="radiogroup" aria-label="Style">
            <LayoutGroup id="room-filter">
              {[{ id: 'all', name: 'All' }, ...designStyles].map((st) => (
                <button key={st.id} role="radio" aria-checked={filter === st.id} className={s.filter} onClick={() => setFilter(st.id)}>
                  {filter === st.id && <motion.span layoutId="filter-pill" className={s.filterPill} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <span className={s.filterLabel}>{st.name}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>
        </div>
      </div>

      <ul
        ref={strip}
        className={s.strip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        data-lenis-prevent-wheel=""
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((it, i) => (
            <motion.li
              key={it.key}
              layout
              className={s.item}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px -5% 0px 0px' }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
              transition={{ duration: 0.8, ease, delay: Math.min(i, 5) * 0.06 }}
            >
              <button
                className={s.card}
                onClick={() => { if (drag.current.moved) { drag.current.moved = false; return; } setOpen(it); }}
                aria-label={`${it.caption}, ${it.styleName}. Open details`}
              >
                <motion.div layoutId={`room-${it.key}`} className={s.cardMedia} transition={{ duration: 0.7, ease }}>
                  <img src={unsplash(it.photo, 680, 850)} alt="" loading="lazy" draggable={false} className={s.cardImg} width={680} height={850} />
                </motion.div>
                <span className={s.cardHover} aria-hidden="true">
                  {it.principles.map((p) => <span key={p}>{p}</span>)}
                </span>
                <span className={s.cardText}>
                  <span className={`display ${s.cardTitle}`}>{it.caption}</span>
                  <span className={s.cardStyle}>{it.styleName}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className={s.controls}>
        <div className={s.track} aria-hidden="true"><motion.span className={s.trackFill} style={{ scaleX: progress }} /></div>
        <div className={s.arrows}>
          <button className={s.arrow} onClick={() => page(-1)} aria-label="Previous rooms"><Icon name="back" /></button>
          <button className={s.arrow} onClick={() => page(1)} aria-label="Next rooms"><Icon name="chevron" /></button>
        </div>
      </div>

      <AnimatePresence>{open && <RoomView item={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}

function RoomView({ item, onClose }: { item: Item; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<Element | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  // Runs once per opening: pause page scroll, move focus in, and put both back on close.
  useEffect(() => {
    returnTo.current = document.activeElement;
    stopScroll();
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      startScroll();
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  return (
    <div className={s.viewRoot} role="dialog" aria-modal="true" aria-labelledby="room-view-title">
      <motion.div className={s.viewScrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
      <div className={s.view}>
        <motion.div layoutId={`room-${item.key}`} className={s.viewMedia} transition={{ duration: 0.7, ease }}>
          <img src={unsplash(item.photo, 1200, 1500)} alt={item.caption} className={s.cardImg} />
        </motion.div>
        <motion.div
          className={s.viewBody}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <button ref={closeRef} className={s.close} onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          <p className={s.viewStyle}>{item.styleName}</p>
          <h3 id="room-view-title" className={`display ${s.viewTitle}`}>{item.caption}</h3>
          <h4 className={s.viewH}>What it gets right</h4>
          <ul className={s.viewList}>{item.principles.map((p) => <li key={p}>{p}</li>)}</ul>
          <h4 className={s.viewH}>Pieces like these</h4>
          <ul className={s.viewProducts}>
            {item.products.map((pid) => {
              const p = productById(pid)!;
              return (
                <li key={pid}>
                  <Link to={`/catalog?p=${pid}`} onClick={onClose}>
                    <img src={unsplash(p.photo, 112, 112)} alt="" width={56} height={56} />
                    <span>{p.name}<small>{p.w} × {p.d} cm</small></span>
                    <strong>{formatPrice(p.price)}</strong>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className={s.viewActions}>
            <Link to={`/knowledge?a=${item.styleId}`} className={s.viewPrimary} onClick={onClose}>Read the {item.styleName} guide</Link>
            <Link to="/planner" className={s.viewSecondary} onClick={onClose}>Plan a room like this</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
