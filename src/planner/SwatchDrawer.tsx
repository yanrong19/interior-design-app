import { useState } from 'react';
import { materials, type Material, type MaterialGroup } from '../data/materials';
import { productById } from '../data/catalog';
import { Icon } from '../components/Icon';
import type { HistoryAction, Plan } from './model';
import s from './Planner.module.css';

const groups: MaterialGroup[] = ['Floor', 'Walls', 'Fabric'];

/** Bottom drawer: try floors, wall paints and fabrics on the plan. */
export function SwatchDrawer({ plan, selected, dispatch, open, onToggle }: {
  plan: Plan;
  selected: string | null;
  dispatch: React.Dispatch<HistoryAction>;
  open: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<MaterialGroup>('Floor');
  const item = plan.items.find((i) => i.uid === selected);
  const upholstered = item && ['sofa', 'chair', 'bed'].includes(productById(item.productId)!.kind);

  const current = tab === 'Floor' ? plan.floor : tab === 'Walls' ? plan.walls : item?.fabric;
  const apply = (m: Material) => {
    if (tab === 'Floor') dispatch({ type: 'floor', id: m.id });
    else if (tab === 'Walls') dispatch({ type: 'walls', id: m.id });
    else if (item && upholstered) dispatch({ type: 'fabric', uid: item.uid, id: m.id });
  };

  return (
    <section className={`${s.drawer} ${open ? s.drawerOpen : ''}`} aria-label="Materials">
      <div className={s.drawerBar}>
        <button className={s.drawerToggle} onClick={onToggle} aria-expanded={open} aria-controls="drawer-body">
          <Icon name="swatch" size={16} /> Materials
          <span className={open ? s.drawerChevOpen : s.drawerChev}><Icon name="down" size={16} /></span>
        </button>
        {open && (
          <div className={s.drawerTabs} role="tablist" aria-label="Material type">
            {groups.map((g) => (
              <button key={g} role="tab" aria-selected={tab === g} onClick={() => setTab(g)}>{g}</button>
            ))}
          </div>
        )}
      </div>
      <div id="drawer-body" className={s.drawerBody} hidden={!open}>
        {tab === 'Fabric' && !upholstered ? (
          <p className={s.drawerEmpty}>Select a sofa, chair or bed on the plan to try fabrics on it.</p>
        ) : (
          <ul className={s.swatchRow}>
            {materials.filter((m) => m.group === tab).map((m) => {
              const fits = m.styles.includes(plan.style);
              return (
                <li key={m.id}>
                  <button className={`${s.swatch} ${current === m.id ? s.swatchOn : ''}`} onClick={() => apply(m)} aria-pressed={current === m.id}>
                    <SwatchArt m={m} />
                    <span className={s.swatchName}>{m.name}</span>
                    <span className={s.swatchNote}>{m.note}</span>
                    {fits && <span className="pill pill-accent">Fits style</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function SwatchArt({ m }: { m: Material }) {
  return (
    <svg viewBox="0 0 64 48" className={s.swatchArt} aria-hidden="true">
      <rect width="64" height="48" fill={m.hex} />
      {m.pattern === 'plank' && [12, 24, 36].map((y) => <line key={y} x1="0" x2="64" y1={y} y2={y} stroke={m.grain} strokeWidth="1" />)}
      {m.pattern === 'plank' && <line x1="30" x2="30" y1="12" y2="24" stroke={m.grain} strokeWidth="1" />}
      {m.pattern === 'speckle' && [[8, 9], [22, 30], [41, 12], [52, 38], [33, 22], [12, 40], [58, 6]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill={m.grain} />)}
      {m.pattern === 'weave' && Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 8 + 4} x2={i * 8 + 4} y1="0" y2="48" stroke={m.grain} strokeWidth="2" opacity="0.6" />)}
    </svg>
  );
}
