import { useState } from 'react';
import { categories, products } from '../data/catalog';
import { Photo } from '../components/Photo';
import { Icon } from '../components/Icon';
import s from './Planner.module.css';

/** Left dock: pieces to drag onto the plan (or press Enter to drop one in the middle). */
export function Library({ onAdd }: { onAdd: (productId: string) => void }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  return (
    <aside className={s.library} aria-label="Pieces">
      <div className={s.libSearch}>
        <Icon name="search" size={16} />
        <label htmlFor="lib-q" className="visually-hidden">Find a piece</label>
        <input id="lib-q" type="search" placeholder="Find a piece" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {categories.map((c) => {
        const items = products.filter((p) => p.category === c && (!needle || p.name.toLowerCase().includes(needle)));
        if (!items.length) return null;
        return (
          <section key={c} className={s.libGroup}>
            <h2 className={s.libHeading}>{c}</h2>
            <ul>
              {items.map((p) => (
                <li key={p.id}>
                  <button
                    className={s.libItem}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/roomwright-product', p.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onAdd(p.id)}
                    aria-label={`Add ${p.name}, ${p.w} by ${p.d} cm, to the plan`}
                  >
                    <Photo id={p.photo} alt="" w={64} h={64} className={s.libThumb} />
                    <span className={s.libName}>{p.name.split(',')[0]}<small>{p.w} × {p.d} cm</small></span>
                    <span className={s.libGrip}><Icon name="grip" size={16} /></span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className={s.libHint}>Drag onto the plan, or click to drop in the middle.</p>
    </aside>
  );
}
