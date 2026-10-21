import { useId, useRef } from 'react';
import { productById } from '../data/catalog';
import { materialById } from '../data/materials';
import { box, door, footprint, freeDistance, snap, windowSpan, checksFor, type Dir, type HistoryAction, type LightMode, type Plan } from './model';
import s from './Planner.module.css';

const WALL = 12;
const PAD = 60;

interface Props {
  plan: Plan;
  dispatch: React.Dispatch<HistoryAction>;
  selected: string | null;
  onSelect: (uid: string | null) => void;
  light: LightMode;
  readOnly?: boolean;
}

/** Top-down floor plan in centimetres. Drag to move (5 cm snap), keyboard to nudge. */
export function PlanCanvas({ plan, dispatch, selected, onSelect, light, readOnly }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, '');
  const plankId = `plank-${uid}`;
  const poolsId = `pools-${uid}`;
  const drag = useRef<{ uid: string; dx: number; dy: number; moved: boolean } | null>(null);

  const toPlan = (clientX: number, clientY: number) => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = el.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const onPointerDown = (e: React.PointerEvent, uid: string) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect(uid);
    const it = plan.items.find((i) => i.uid === uid)!;
    const p = toPlan(e.clientX, e.clientY);
    drag.current = { uid, dx: p.x - it.x, dy: p.y - it.y, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = toPlan(e.clientX, e.clientY);
    const it = plan.items.find((i) => i.uid === drag.current!.uid);
    const x = snap(p.x - drag.current.dx), y = snap(p.y - drag.current.dy);
    if (!it || (it.x === x && it.y === y)) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      dispatch({ type: 'checkpoint' });
    }
    dispatch({ type: 'move', uid: drag.current.uid, x, y });
  };

  const endDrag = () => { drag.current = null; };

  const onKeyDown = (e: React.KeyboardEvent, uid: string) => {
    if (readOnly) return;
    const it = plan.items.find((i) => i.uid === uid)!;
    const step = e.shiftKey ? 25 : 5;
    const moves: Record<string, [number, number]> = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] };
    if (moves[e.key]) {
      e.preventDefault();
      if (!e.repeat) dispatch({ type: 'checkpoint' });
      dispatch({ type: 'move', uid, x: it.x + moves[e.key][0], y: it.y + moves[e.key][1] });
    } else if (e.key === 'r' || e.key === 'R') {
      dispatch({ type: 'rotate', uid });
    } else if (e.key === 'Delete') {
      e.preventDefault();
      dispatch({ type: 'remove', uid });
      onSelect(null);
    } else if (e.key === 'Escape') {
      onSelect(null);
      (e.currentTarget as SVGElement).blur();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/roomwright-product');
    if (!id) return;
    const p = toPlan(e.clientX, e.clientY);
    dispatch({ type: 'add', productId: id, x: p.x, y: p.y });
  };

  const floor = materialById(plan.floor)!;
  const walls = materialById(plan.walls)!;
  const lamps = plan.items.filter((i) => productById(i.productId)!.kind === 'lamp');
  const sel = plan.items.find((i) => i.uid === selected);

  return (
    <svg
      ref={svg}
      className={s.planSvg}
      viewBox={`${-PAD} ${-PAD} ${plan.roomW + PAD * 2} ${plan.roomD + PAD * 2}`}
      role="application"
      aria-label={`Floor plan of ${plan.name}, ${plan.roomW} by ${plan.roomD} centimetres. ${plan.items.length} pieces.`}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={() => onSelect(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <defs>
        <pattern id={plankId} width={plan.roomW} height="20" patternUnits="userSpaceOnUse">
          <rect width={plan.roomW} height="20" fill={floor.hex} />
          {floor.pattern === 'plank' && <line x1="0" y1="19.5" x2={plan.roomW} y2="19.5" stroke={floor.grain} strokeWidth="1" />}
          {floor.pattern === 'speckle' && (
            <>
              <circle cx="13" cy="6" r="1.4" fill={floor.grain} />
              <circle cx="61" cy="14" r="1" fill={floor.grain} />
              <circle cx="140" cy="4" r="1.6" fill={floor.grain} />
              <circle cx="233" cy="12" r="1.2" fill={floor.grain} />
              <circle cx="318" cy="7" r="1.5" fill={floor.grain} />
            </>
          )}
        </pattern>
        <mask id={poolsId}>
          <rect x={-PAD} y={-PAD} width={plan.roomW + PAD * 2} height={plan.roomD + PAD * 2} fill="white" />
          {lamps.map((l) => <circle key={l.uid} cx={l.x} cy={l.y} r={150} fill="black" />)}
        </mask>
      </defs>

      {/* Walls, painted in the wall colour */}
      <rect x={-WALL} y={-WALL} width={plan.roomW + WALL * 2} height={plan.roomD + WALL * 2} fill={walls.hex} stroke="#1a1a1a" strokeWidth={2} />
      <rect x={0} y={0} width={plan.roomW} height={plan.roomD} fill={`url(#${plankId})`} stroke="#1a1a1a" strokeWidth={1.5} />

      {/* Window */}
      <rect x={windowSpan.from} y={-WALL} width={windowSpan.to - windowSpan.from} height={WALL} fill="#dfe8ee" stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={windowSpan.from} x2={windowSpan.to} y1={-WALL / 2} y2={-WALL / 2} stroke="#1a1a1a" strokeWidth={1} />
      <text x={(windowSpan.from + windowSpan.to) / 2} y={-WALL - 10} textAnchor="middle" className={s.planLabel}>Window</text>

      {/* Door and its swing */}
      <rect x={-WALL} y={door.from} width={WALL} height={door.to - door.from} fill="#f9f9fb" />
      <path d={`M0 ${door.from} L${door.to - door.from} ${door.from} A ${door.to - door.from} ${door.to - door.from} 0 0 1 0 ${door.to}`} fill="rgba(26,26,26,0.04)" stroke="#1a1a1a" strokeWidth={1} />
      <text x={-WALL - 8} y={(door.from + door.to) / 2} textAnchor="end" dominantBaseline="middle" className={s.planLabel}>Door</text>

      {/* Daylight from the window */}
      {light === 'day' && (
        <polygon
          points={`${windowSpan.from},0 ${windowSpan.to},0 ${windowSpan.to + 60},${plan.roomD * 0.55} ${windowSpan.from - 60},${plan.roomD * 0.55}`}
          fill="rgba(255, 244, 214, 0.45)"
          pointerEvents="none"
        />
      )}

      {/* Room dimensions */}
      <text x={plan.roomW / 2} y={plan.roomD + WALL + 26} textAnchor="middle" className={s.planDim}>{plan.roomW} cm</text>
      <text x={plan.roomW + WALL + 22} y={plan.roomD / 2} textAnchor="middle" dominantBaseline="middle" transform={`rotate(90 ${plan.roomW + WALL + 22} ${plan.roomD / 2})`} className={s.planDim}>{plan.roomD} cm</text>

      {/* Pieces */}
      {plan.items.map((it) => {
        const p = productById(it.productId)!;
        const { w, d } = footprint(it, p);
        const b = box(it);
        const isSel = it.uid === selected;
        const failing = checksFor(plan, it).some((c) => c.state === 'fail');
        const fabric = it.fabric ? materialById(it.fabric)?.hex : undefined;
        const fill = fabric ?? kindFill[p.kind];
        const short = p.name.split(/[,]/)[0].replace(/ (three|two)-seat| lounge| side| bar| round| coffee| floor| wall| upholstered/gi, '');
        return (
          <g
            key={it.uid}
            className={s.piece}
            tabIndex={readOnly ? -1 : 0}
            role="button"
            aria-pressed={isSel}
            aria-label={`${p.name}, ${w} by ${d} cm${failing ? ', breaks a rule' : ''}. Arrow keys move, R rotates, Delete removes.`}
            onPointerDown={(e) => onPointerDown(e, it.uid)}
            onKeyDown={(e) => onKeyDown(e, it.uid)}
            onFocus={() => !readOnly && onSelect(it.uid)}
          >
            {p.kind === 'lamp' ? (
              <circle cx={it.x} cy={it.y} r={w / 2} fill={fill} stroke={isSel ? '#2f5d50' : failing ? '#a8321f' : '#1a1a1a'} strokeWidth={isSel || failing ? 3 : 1} />
            ) : (
              <rect x={b.l} y={b.t} width={w} height={d} rx={p.kind === 'sofa' || p.kind === 'bed' ? 6 : 2} fill={fill} stroke={isSel ? '#2f5d50' : failing ? '#a8321f' : '#1a1a1a'} strokeWidth={isSel || failing ? 3 : 1} />
            )}
            {(p.kind === 'sofa' || p.kind === 'chair') && <BackRest it={it} b={b} />}
            {w > 70 && d > 30 && (
              <text x={it.x} y={it.y} textAnchor="middle" dominantBaseline="middle" className={s.pieceLabel} fill={textOn(fill)}>
                {short}
              </text>
            )}
          </g>
        );
      })}

      {/* Measurements around the selected piece */}
      {sel && <Measures plan={plan} uid={sel.uid} />}

      {/* Evening: everything outside a lamp's pool goes dark */}
      {light === 'evening' && (
        <rect x={-PAD} y={-PAD} width={plan.roomW + PAD * 2} height={plan.roomD + PAD * 2} fill="rgba(18, 22, 38, 0.42)" mask={`url(#${poolsId})`} pointerEvents="none" />
      )}
    </svg>
  );
}

const kindFill: Record<string, string> = {
  sofa: '#3a3b3c',
  chair: '#6f7b8b',
  'coffee-table': '#c8a27a',
  table: '#e9e5dc',
  stool: '#d9cbb4',
  lamp: '#f2e3b6',
  storage: '#b88f66',
  bed: '#ede8df',
};

function textOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#1a1a1a' : '#ffffff';
}

/** A strip along the back of a seat, so you can see which way it faces. */
function BackRest({ it, b }: { it: { rot: number }; b: { l: number; t: number; r: number; b: number } }) {
  const t = 12;
  const r = { 0: [b.l, b.b - t, b.r - b.l, t], 90: [b.l, b.t, t, b.b - b.t], 180: [b.l, b.t, b.r - b.l, t], 270: [b.r - t, b.t, t, b.b - b.t] }[it.rot as 0 | 90 | 180 | 270];
  return <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill="rgba(0,0,0,0.22)" pointerEvents="none" />;
}

function Measures({ plan, uid }: { plan: Plan; uid: string }) {
  const it = plan.items.find((i) => i.uid === uid)!;
  const b = box(it);
  const cx = it.x, cy = it.y;
  const dirs: Dir[] = ['up', 'right', 'down', 'left'];
  return (
    <g pointerEvents="none">
      {dirs.map((dir) => {
        const { dist } = freeDistance(plan, it, dir);
        if (dist <= 0) return null;
        const [x1, y1, x2, y2] =
          dir === 'up' ? [cx, b.t, cx, b.t - dist] :
          dir === 'down' ? [cx, b.b, cx, b.b + dist] :
          dir === 'left' ? [b.l, cy, b.l - dist, cy] : [b.r, cy, b.r + dist, cy];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return (
          <g key={dir}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2f5d50" strokeWidth={1.5} />
            <line x1={x2 - (dir === 'up' || dir === 'down' ? 5 : 0)} y1={y2 - (dir === 'left' || dir === 'right' ? 5 : 0)} x2={x2 + (dir === 'up' || dir === 'down' ? 5 : 0)} y2={y2 + (dir === 'left' || dir === 'right' ? 5 : 0)} stroke="#2f5d50" strokeWidth={1.5} />
            <rect x={mx - 17} y={my - 9} width={34} height={18} rx={3} fill="#2f5d50" />
            <text x={mx} y={my + 0.5} textAnchor="middle" dominantBaseline="middle" className={s.measureText}>{dist}</text>
          </g>
        );
      })}
    </g>
  );
}
