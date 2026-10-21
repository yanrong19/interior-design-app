import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Photo } from './Photo';
import { Icon } from './Icon';
import type { Hotspot } from '../data/knowledge';
import { productById, formatPrice } from '../data/catalog';
import s from './Hotspots.module.css';

/** A room photograph with markers; each opens the specs of what it points at. */
export function Hotspots({ photo, alt, pins }: { photo: string; alt: string; pins: Hotspot[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  const pin = open !== null ? pins[open] : null;
  const product = pin?.productId ? productById(pin.productId) : undefined;

  return (
    <div className={s.wrap} ref={wrap}>
      <div className={s.frame}>
        <Photo id={photo} alt={alt} w={1200} h={760} className={s.img} />
        {pins.map((p, i) => (
          <motion.button
            key={p.title}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.5 + i * 0.09 }}
            className={`${s.pin} ${open === i ? s.pinOn : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={`${p.title}: show details`}
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span />
          </motion.button>
        ))}
      </div>
      <div className={s.detail} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
        {pin ? (
          <motion.div key={pin.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <div className={s.detailHead}>
              <p className={s.detailTitle}>{pin.title}</p>
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(null)} aria-label="Close details"><Icon name="close" size={16} /></button>
            </div>
            <dl className={s.specs}>
              {pin.specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            {product && (
              <Link to={`/catalog?p=${product.id}`} className={s.product}>
                <Photo id={product.photo} alt="" w={96} h={96} className={s.productImg} />
                <span>{product.name}<small>{product.w} × {product.d} × {product.h} cm</small></span>
                <strong>{formatPrice(product.price)}</strong>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.p key="hint" className={s.hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Select a marker on the photo to see its measurements.</motion.p>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
