import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Mark } from '../components/Mark';
import { designStyles } from '../data/styles';
import { formatPrice, productById, type StyleId } from '../data/catalog';
import { PlanCanvas } from '../planner/PlanCanvas';
import { Library } from '../planner/Library';
import { Assistant } from '../planner/Assistant';
import { SwatchDrawer } from '../planner/SwatchDrawer';
import { emptyPlan, historyReducer, planSummary, templatePlan, type HistoryAction, type LightMode, type Plan } from '../planner/model';
import s from '../planner/Planner.module.css';

const STORE = 'roomwright.plan.v1';

function readSaved(): Plan | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Plan) : null;
  } catch {
    return null; // storage blocked or corrupt
  }
}

function initialPlan(params: URLSearchParams): Plan {
  const name = params.get('name');
  const start = params.get('start');
  if (start === 'blank') return emptyPlan(name || 'My room');
  if (start === 'template') return templatePlan(name || 'Living room');
  return readSaved() ?? templatePlan(name || 'Living room');
}

export function Planner() {
  const [params, setParams] = useSearchParams();
  const [history, rawDispatch] = useReducer(historyReducer, params, (p) => ({ past: [], present: initialPlan(p), future: [] }));
  const plan = history.present;
  const [selected, setSelected] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);

  // Intercept removals so the canvas and assistant both get the "Removed · Undo" notice.
  const dispatch = useCallback((a: HistoryAction) => {
    if (a.type === 'remove') {
      const it = plan.items.find((i) => i.uid === a.uid);
      if (it) setRemoved(productById(it.productId)!.name.split(',')[0]);
    }
    if (a.type === 'undo' || a.type === 'redo') setRemoved(null);
    rawDispatch(a);
  }, [plan.items]);

  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(null), 6000);
    return () => clearTimeout(t);
  }, [removed]);

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo (not while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'undo' }); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); dispatch({ type: 'redo' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  // Drop the selection if undo/redo removed the selected piece.
  useEffect(() => {
    if (selected && !plan.items.some((i) => i.uid === selected)) setSelected(null);
  }, [plan.items, selected]);
  const [light, setLight] = useState<LightMode>('day');
  // The drawer starts closed on tablets so the plan gets the height.
  const [drawerOpen, setDrawerOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  const [saved, setSaved] = useState<'draft' | 'saved' | 'error'>('draft');
  const addedFromUrl = useRef(false);

  // ?add=<product> from the catalog drops that piece into the middle of the room.
  useEffect(() => {
    const add = params.get('add');
    if (add && productById(add) && !addedFromUrl.current) {
      addedFromUrl.current = true;
      dispatch({ type: 'add', productId: add });
      setParams({}, { replace: true });
    } else if (params.get('start')) {
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  // Select a piece that just appeared (an add, or one brought back by undo).
  const known = useRef(new Set(plan.items.map((i) => i.uid)));
  useEffect(() => {
    const fresh = plan.items.find((i) => !known.current.has(i.uid));
    if (fresh) setSelected(fresh.uid);
    known.current = new Set(plan.items.map((i) => i.uid));
    setSaved((v) => (v === 'saved' ? 'draft' : v));
  }, [plan]);

  // Saving replaces the one plan kept in this browser. If that plan is not the one open here
  // (you started a new room from Home), ask before overwriting it.
  const ownsSaved = useRef(!params.get('start') || !readSaved());
  const [confirmReplace, setConfirmReplace] = useState<Plan | null>(null);

  const write = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(plan));
      ownsSaved.current = true;
      setSaved('saved');
    } catch {
      setSaved('error');
    }
    setConfirmReplace(null);
  };

  const save = () => {
    const existing = readSaved();
    if (existing && !ownsSaved.current) setConfirmReplace(existing);
    else write();
  };

  const sum = planSummary(plan);

  return (
    <div className={s.app}>
      <header className={s.top}>
        <div className={s.topLeft}>
          <Link to="/" className="btn btn-ghost btn-icon" aria-label="Back to Roomwright home"><Icon name="back" /></Link>
          <Mark size={22} />
          <h1 className={s.nameH1}>
            <label htmlFor="plan-name" className="visually-hidden">Room name</label>
            <input id="plan-name" className={s.nameInput} value={plan.name} onChange={(e) => dispatch({ type: 'rename', name: e.target.value })} maxLength={40} size={Math.max(plan.name.length, 6)} />
          </h1>
          <span className={`pill ${saved === 'saved' ? 'pill-pass' : saved === 'error' ? 'pill-fail' : ''}`} role="status">
            {saved === 'saved' ? 'Saved in this browser' : saved === 'error' ? 'Not saved: browser storage is blocked' : 'Draft'}
          </span>
        </div>
        <div className={s.topRight}>
          <div className={s.history}>
            <button className="btn btn-ghost btn-icon" onClick={() => dispatch({ type: 'undo' })} disabled={!history.past.length} aria-label="Undo" title="Undo (Ctrl+Z) · keeps the last 60 steps"><Icon name="undo" /></button>
            <button className="btn btn-ghost btn-icon" onClick={() => dispatch({ type: 'redo' })} disabled={!history.future.length} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><Icon name="redo" /></button>
          </div>
          <span className={s.divider} aria-hidden="true" />
          <label htmlFor="plan-style" className="visually-hidden">Room style</label>
          <select id="plan-style" className={s.topSelect} value={plan.style} onChange={(e) => dispatch({ type: 'style', style: e.target.value as StyleId })}>
            {designStyles.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>
          <div className={s.lightToggle} role="radiogroup" aria-label="Lighting">
            {(['day', 'evening'] as const).map((m) => (
              <button key={m} role="radio" aria-checked={light === m} onClick={() => setLight(m)}>
                {light === m && <motion.span layoutId="light-pill" className={s.lightPill} transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
                <span className={s.lightLabel}><Icon name={m === 'day' ? 'sun' : 'moon'} size={16} /> {m === 'day' ? 'Daylight' : 'Evening'}</span>
              </button>
            ))}
          </div>
          <span className={s.divider} aria-hidden="true" />
          <Link to="/catalog" className="btn btn-ghost">Catalog</Link>
          <button className="btn btn-primary" onClick={save} aria-haspopup="dialog">Save plan</button>
        </div>
        <AnimatePresence>
        {confirmReplace && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={s.confirm} onKeyDown={(e) => e.key === 'Escape' && setConfirmReplace(null)} role="alertdialog" aria-labelledby="replace-title" aria-describedby="replace-desc">
            <p id="replace-title" className={s.confirmTitle}>Replace your saved plan?</p>
            <p id="replace-desc">
              This browser keeps one plan. Saving replaces “{confirmReplace.name}” ({confirmReplace.items.length} {confirmReplace.items.length === 1 ? 'piece' : 'pieces'}) with “{plan.name}”. This can’t be undone.
            </p>
            <div className={s.confirmActions}>
              <button className="btn" onClick={() => setConfirmReplace(null)} autoFocus>Keep the saved plan</button>
              <button className="btn btn-danger" onClick={write}>Replace it</button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </header>

      <div className={s.work}>
        <Library onAdd={(id) => dispatch({ type: 'add', productId: id })} />

        <section className={s.canvasPanel} aria-label="Plan">
          <div className={s.canvasOverlay}>
            <span>{plan.roomW} × {plan.roomD} cm · {(plan.roomW * plan.roomD / 10000).toFixed(1)} m²</span>
            <span className={`pill ${sum.problems.length ? 'pill-warn' : 'pill-pass'}`}>{sum.passed} of {sum.checks} checks met</span>
          </div>
          <div className={s.canvasWell}>
            <PlanCanvas plan={plan} dispatch={dispatch} selected={selected} onSelect={setSelected} light={light} />
          </div>
          <AnimatePresence>
            {removed && (
              <motion.div
                key={removed}
                className={s.toast}
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              >
                <span>Removed {removed}</span>
                <button className={s.toastAction} onClick={() => dispatch({ type: 'undo' })}>Undo</button>
              </motion.div>
            )}
          </AnimatePresence>
          <p className={s.canvasHelp}>
            Drag to move · <kbd>R</kbd> rotate · <kbd>Delete</kbd> remove · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · arrows nudge 5 cm, Shift 25 cm
          </p>
          <SwatchDrawer plan={plan} selected={selected} dispatch={dispatch} open={drawerOpen} onToggle={() => setDrawerOpen((o) => !o)} />
        </section>

        <Assistant plan={plan} selected={selected} onSelect={setSelected} dispatch={dispatch} />
      </div>

      {/* Phone: editing a floor plan needs a pointer and room; show it read-only with the checks. */}
      <div className={s.phone}>
        <p className={s.phoneNote}>Moving furniture needs a wider screen, such as a tablet or computer. Here you can review the plan and its checks.</p>
        <div className={s.phonePlan}>
          <PlanCanvas plan={plan} dispatch={dispatch} selected={null} onSelect={() => {}} light={light} readOnly />
        </div>
        <p className={s.phoneSum}>{sum.passed} of {sum.checks} checks met · {plan.items.length} pieces · {formatPrice(sum.cost)}</p>
        <ul className={s.phoneList}>
          {plan.items.map((i) => {
            const p = productById(i.productId)!;
            const bad = sum.problems.filter((c) => c.item.uid === i.uid);
            return (
              <li key={i.uid}>
                <span>{p.name}<small>{p.w} × {p.d} cm</small></span>
                <span className={`pill ${bad.length ? 'pill-warn' : 'pill-pass'}`}>{bad.length ? `${bad.length} to fix` : 'Clear'}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
