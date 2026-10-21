import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Photo } from '../components/Photo';
import { Icon } from '../components/Icon';
import { categories, formatPrice, productById, productRooms, products, rooms, type RoomId, type StyleId } from '../data/catalog';
import { designStyles } from '../data/styles';
import s from './Catalog.module.css';

const priceBands = [
  { id: '', label: 'Any price' },
  { id: '0-500', label: 'Under €500' },
  { id: '500-1500', label: '€500–1,500' },
  { id: '1500-', label: 'Over €1,500' },
];

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';
  const cat = params.get('cat') ?? '';
  const style = (params.get('style') ?? '') as StyleId | '';
  const price = params.get('price') ?? '';
  const room = (rooms.some((r) => r.id === params.get('room')) ? params.get('room') : '') as RoomId | '';
  const roomLabel = rooms.find((r) => r.id === room)?.label;
  const selectedId = params.get('p');

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const [lo, hi] = price ? price.split('-').map((n) => (n ? Number(n) : Infinity)) : [0, Infinity];
    const needle = q.trim().toLowerCase();
    return products.filter((p) =>
      (!cat || p.category === cat) &&
      (!style || p.styles.includes(style)) &&
      (!room || productRooms(p).includes(room)) &&
      p.price >= (lo || 0) && p.price < (hi ?? Infinity) &&
      (!needle || `${p.name} ${p.material} ${p.category}`.toLowerCase().includes(needle)),
    );
  }, [q, cat, style, price, room]);

  const selected = selectedId ? productById(selectedId) : list[0];
  const filtered = Boolean(q || cat || style || price || room);

  // When the detail panel sits below the list (narrow screens), bring it into view on selection.
  const detailRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (selectedId && window.matchMedia('(max-width: 1180px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }, [selectedId]);

  return (
    <AppShell title="Catalog">
      <div className={s.layout}>
        <div className={s.main}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Catalog</h1>
            <p className={s.count}>{list.length} of {products.length} pieces</p>
          </div>

          <div className={s.filters}>
            <div className={s.segment} role="radiogroup" aria-label="Category">
              {['', ...categories].map((c) => (
                <button key={c || 'all'} role="radio" aria-checked={cat === c} onClick={() => set('cat', c)}>
                  {c || 'All'}
                </button>
              ))}
            </div>
            <div className={s.selects}>
              <label className="visually-hidden" htmlFor="f-room">Room</label>
              <select id="f-room" value={room} onChange={(e) => set('room', e.target.value)} className={s.select}>
                <option value="">Any room</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <label className="visually-hidden" htmlFor="f-style">Style</label>
              <select id="f-style" value={style} onChange={(e) => set('style', e.target.value)} className={s.select}>
                <option value="">Any style</option>
                {designStyles.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
              <label className="visually-hidden" htmlFor="f-price">Price</label>
              <select id="f-price" value={price} onChange={(e) => set('price', e.target.value)} className={s.select}>
                {priceBands.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              <div className={s.search}>
                <Icon name="search" size={16} />
                <label className="visually-hidden" htmlFor="f-q">Filter by name or material</label>
                <input id="f-q" type="search" placeholder="Name or material" value={q} onChange={(e) => set('q', e.target.value)} />
              </div>
            </div>
          </div>

          {roomLabel && (
            <p className={s.roomNote}>
              Showing pieces for a {roomLabel.toLowerCase()}.{' '}
              <Link to={`/knowledge?a=${room}`}>Read the {roomLabel.toLowerCase()} guide</Link> for its clearances.
            </p>
          )}

          {list.length === 0 ? (
            <div className={s.empty}>
              <p className={s.emptyTitle}>No pieces match these filters</p>
              <p>Try another price band or clear the style.</p>
              <button className="btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
            </div>
          ) : (
            <table className={s.table}>
              <caption className="visually-hidden">Pieces{filtered ? ', filtered' : ''}</caption>
              <thead>
                <tr>
                  <th scope="col">Piece</th>
                  <th scope="col" className={s.hideSm}>Category</th>
                  <th scope="col" className={`${s.num} ${s.hideSm}`}>W × D × H cm</th>
                  <th scope="col" className={s.num}>Price</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                {list.map((p) => {
                  const isSel = selected?.id === p.id;
                  return (
                    <motion.tr
                      key={p.id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={isSel ? s.rowOn : undefined}
                      onClick={() => set('p', p.id)}
                    >
                      <td>
                        <button className={s.rowBtn} onClick={(e) => { e.stopPropagation(); set('p', p.id); }} aria-pressed={isSel}>
                          <Photo id={p.photo} alt="" w={96} h={96} className={s.thumb} />
                          <span className={s.name}>{p.name}<small>{p.material}</small></span>
                        </button>
                      </td>
                      <td className={s.hideSm}>{p.category}</td>
                      <td className={`${s.num} ${s.hideSm}`}>{p.w} × {p.d} × {p.h}</td>
                      <td className={s.num}>{formatPrice(p.price)}</td>
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <aside className={s.detail} aria-label={`${selected.name} details`} ref={detailRef}>
            <AnimatePresence mode="wait" initial={false}>
            <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <Photo id={selected.photo} alt={selected.name} w={720} h={540} className={s.detailImg} />
            <div className={s.detailHead}>
              <h2 className={s.detailTitle}>{selected.name}</h2>
              <p className={s.detailPrice}>{formatPrice(selected.price)}</p>
            </div>
            <p className={s.detailMaterial}>{selected.material}</p>
            <dl className={s.well}>
              <div><dt>Width</dt><dd>{selected.w} cm</dd></div>
              <div><dt>Depth</dt><dd>{selected.d} cm</dd></div>
              <div><dt>Height</dt><dd>{selected.h} cm</dd></div>
              <div><dt>Styles</dt><dd>{selected.styles.map((id) => designStyles.find((d) => d.id === id)!.name).join(', ')}</dd></div>
            </dl>
            <h3 className={s.h3}>Care</h3>
            <p className={s.care}>{selected.care}</p>
            <h3 className={s.h3}>Pairs well with</h3>
            <ul className={s.pairs}>
              {selected.pairs.map((pid) => {
                const p = productById(pid)!;
                return (
                  <li key={pid}>
                    <button className={s.pair} onClick={() => set('p', pid)}>
                      <Photo id={p.photo} alt="" w={80} h={80} className={s.pairImg} />
                      <span>{p.name}<small>{formatPrice(p.price)}</small></span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={s.detailActions}>
              <button className="btn btn-primary" onClick={() => navigate(`/planner?add=${selected.id}`)}>
                <Icon name="plus" size={16} /> Add to my plan
              </button>
              <Link to="/knowledge?a=clearances" className="btn btn-ghost">Clearance rules</Link>
            </div>
            </motion.div>
            </AnimatePresence>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
