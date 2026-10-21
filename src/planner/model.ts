import { productById, type Product, type StyleId } from '../data/catalog';
import { clearances } from '../data/rules';

export type Rotation = 0 | 90 | 180 | 270;
export type LightMode = 'day' | 'evening';

export interface PlanItem {
  uid: string;
  productId: string;
  /** centre, in cm from the room's top-left inner corner */
  x: number;
  y: number;
  rot: Rotation;
  fabric?: string;
}

export interface Plan {
  name: string;
  roomW: number;
  roomD: number;
  floor: string;
  walls: string;
  style: StyleId;
  items: PlanItem[];
}

/** Fixed openings for the sample room (cm). */
export const door = { wall: 'left' as const, from: 40, to: 130 };
export const windowSpan = { wall: 'top' as const, from: 120, to: 300 };

let uidSeq = 0;
export const newUid = () => `i${Date.now().toString(36)}${(uidSeq++).toString(36)}`;

export function templatePlan(name: string): Plan {
  return {
    name,
    roomW: 420,
    roomD: 360,
    floor: 'oak',
    walls: 'chalk',
    style: 'japandi',
    items: [
      { uid: newUid(), productId: 'ardo-sofa', x: 210, y: 312.5, rot: 0 },
      { uid: newUid(), productId: 'nest-tables', x: 210, y: 190, rot: 0 },
      { uid: newUid(), productId: 'otto-chair', x: 360, y: 200, rot: 270 },
      { uid: newUid(), productId: 'arc-lamp', x: 400, y: 300, rot: 0 },
      { uid: newUid(), productId: 'float-shelves', x: 360, y: 11, rot: 0 },
    ],
  };
}

export const emptyPlan = (name: string): Plan => ({ ...templatePlan(name), items: [] });

/* ---------------- Reducer ---------------- */

export type Action =
  | { type: 'add'; productId: string; x?: number; y?: number }
  | { type: 'move'; uid: string; x: number; y: number }
  | { type: 'rotate'; uid: string }
  | { type: 'remove'; uid: string }
  | { type: 'rename'; name: string }
  | { type: 'floor'; id: string }
  | { type: 'walls'; id: string }
  | { type: 'fabric'; uid: string; id: string }
  | { type: 'style'; style: StyleId }
  | { type: 'load'; plan: Plan };

export function reducer(plan: Plan, a: Action): Plan {
  switch (a.type) {
    case 'add':
      return { ...plan, items: [...plan.items, { uid: newUid(), productId: a.productId, x: snap(a.x ?? plan.roomW / 2), y: snap(a.y ?? plan.roomD / 2), rot: 0 }] };
    case 'move':
      return { ...plan, items: plan.items.map((i) => (i.uid === a.uid ? { ...i, x: a.x, y: a.y } : i)) };
    case 'rotate':
      return { ...plan, items: plan.items.map((i) => (i.uid === a.uid ? { ...i, rot: (((i.rot + 90) % 360) as Rotation) } : i)) };
    case 'remove':
      return { ...plan, items: plan.items.filter((i) => i.uid !== a.uid) };
    case 'rename':
      return { ...plan, name: a.name };
    case 'floor':
      return { ...plan, floor: a.id };
    case 'walls':
      return { ...plan, walls: a.id };
    case 'fabric':
      return { ...plan, items: plan.items.map((i) => (i.uid === a.uid ? { ...i, fabric: a.id } : i)) };
    case 'style':
      return { ...plan, style: a.style };
    case 'load':
      return a.plan;
  }
}

export const snap = (n: number, step = 5) => Math.round(n / step) * step;

/* ---------------- Undo history ---------------- */

export interface History { past: Plan[]; present: Plan; future: Plan[] }
export type HistoryAction = Action | { type: 'undo' } | { type: 'redo' } | { type: 'checkpoint' };

const LIMIT = 60;

/** Wraps the plan reducer with undo/redo. Drags call `checkpoint` once, then stream `move`s. */
export function historyReducer(h: History, a: HistoryAction): History {
  switch (a.type) {
    case 'undo':
      if (!h.past.length) return h;
      return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
    case 'redo':
      if (!h.future.length) return h;
      return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
    case 'checkpoint':
      return { past: [...h.past, h.present].slice(-LIMIT), present: h.present, future: [] };
    case 'move':
    case 'rename':
      return { ...h, present: reducer(h.present, a) };
    case 'load':
      return { past: [], present: a.plan, future: [] };
    default: {
      const next = reducer(h.present, a);
      if (next === h.present) return h;
      return { past: [...h.past, h.present].slice(-LIMIT), present: next, future: [] };
    }
  }
}

/* ---------------- Geometry ---------------- */

export interface Box { l: number; t: number; r: number; b: number }

export function footprint(item: PlanItem, p: Product = productById(item.productId)!) {
  const sideways = item.rot === 90 || item.rot === 270;
  return { w: sideways ? p.d : p.w, d: sideways ? p.w : p.d };
}

export function box(item: PlanItem): Box {
  const { w, d } = footprint(item);
  return { l: item.x - w / 2, t: item.y - d / 2, r: item.x + w / 2, b: item.y + d / 2 };
}

const overlaps = (a: Box, b: Box) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;

export function gap(a: Box, b: Box) {
  const dx = Math.max(0, a.l - b.r, b.l - a.r);
  const dy = Math.max(0, a.t - b.b, b.t - a.b);
  return dx && dy ? Math.hypot(dx, dy) : dx + dy;
}

export type Dir = 'up' | 'right' | 'down' | 'left';

/** Free distance from a box's side to the nearest obstacle or wall in that direction. */
export function freeDistance(plan: Plan, self: PlanItem, dir: Dir, ignore: (i: PlanItem) => boolean = () => false) {
  const a = box(self);
  let best = dir === 'up' ? a.t : dir === 'left' ? a.l : dir === 'down' ? plan.roomD - a.b : plan.roomW - a.r;
  let hit: PlanItem | null = null;
  for (const other of plan.items) {
    if (other.uid === self.uid || ignore(other)) continue;
    const b = box(other);
    const vertical = dir === 'up' || dir === 'down';
    const spans = vertical ? b.l < a.r && a.l < b.r : b.t < a.b && a.t < b.b;
    if (!spans) continue;
    const d = dir === 'up' ? a.t - b.b : dir === 'down' ? b.t - a.b : dir === 'left' ? a.l - b.r : b.l - a.r;
    if (d >= 0 && d < best) { best = d; hit = other; }
  }
  return { dist: Math.round(best), hit };
}

/** Direction a seat faces: rot 0 has its back to the bottom wall and faces up. */
export const facing = (rot: Rotation): Dir => (({ 0: 'up', 90: 'right', 180: 'down', 270: 'left' } as const)[rot]);

/* ---------------- Rules ---------------- */

export type CheckState = 'pass' | 'fail' | 'warn';
export interface Check { id: string; label: string; value: string; target: string; state: CheckState }

export function checksFor(plan: Plan, item: PlanItem): Check[] {
  const p = productById(item.productId)!;
  const b = box(item);
  const out: Check[] = [];

  const inside = b.l >= -0.5 && b.t >= -0.5 && b.r <= plan.roomW + 0.5 && b.b <= plan.roomD + 0.5;
  out.push({ id: 'inside', label: 'Inside the walls', value: inside ? 'Yes' : 'No', target: 'Whole footprint in the room', state: inside ? 'pass' : 'fail' });

  const clash = plan.items.find((o) => o.uid !== item.uid && overlaps(b, box(o)));
  out.push({
    id: 'overlap',
    label: 'Clear of other pieces',
    value: clash ? `Overlaps ${productById(clash.productId)!.name.split(',')[0]}` : 'Yes',
    target: 'No overlapping footprints',
    state: clash ? 'fail' : 'pass',
  });

  const doorZone: Box = { l: 0, t: door.from, r: clearances.doorSwing, b: door.to };
  const blocksDoor = overlaps(b, doorZone);
  out.push({ id: 'door', label: 'Door swing', value: blocksDoor ? 'Blocked' : 'Clear', target: '90 cm in front of the door', state: blocksDoor ? 'fail' : 'pass' });

  if (p.kind === 'coffee-table') {
    const sofas = plan.items.filter((o) => productById(o.productId)!.kind === 'sofa');
    if (sofas.length) {
      const g = Math.round(Math.min(...sofas.map((s) => gap(b, box(s)))));
      const ok = g >= clearances.sofaToCoffeeMin && g <= clearances.sofaToCoffeeMax;
      out.push({ id: 'coffee', label: 'Gap to sofa', value: `${g} cm`, target: '40–50 cm', state: ok ? 'pass' : g < 30 || g > 70 ? 'fail' : 'warn' });
    }
  }

  if (p.kind === 'sofa' || p.kind === 'chair') {
    const dir = facing(item.rot);
    const first = freeDistance(plan, item, dir);
    let walk = first.dist;
    let via = '';
    if (first.hit && productById(first.hit.productId)!.kind === 'coffee-table') {
      walk = freeDistance(plan, first.hit, dir, (o) => o.uid === item.uid).dist;
      via = ' past the table';
    }
    const need = p.kind === 'sofa' ? clearances.walkway : 60;
    out.push({ id: 'walk', label: `Walkway in front${via}`, value: `${walk} cm`, target: `${need} cm or more`, state: walk >= need ? 'pass' : walk >= need - 15 ? 'warn' : 'fail' });
  }

  if (p.kind === 'bed') {
    const sides: Dir[] = item.rot % 180 === 0 ? ['left', 'right'] : ['up', 'down'];
    const min = Math.min(...sides.map((d) => freeDistance(plan, item, d).dist));
    out.push({ id: 'bed', label: 'Beside the bed', value: `${min} cm`, target: '60 cm each side', state: min >= clearances.bedSide ? 'pass' : 'fail' });
  }

  if (p.kind === 'table' || p.kind === 'stool') {
    const min = Math.min(...(['up', 'right', 'down', 'left'] as Dir[]).map((d) => freeDistance(plan, item, d).dist));
    out.push({ id: 'pull', label: 'Room to pull out a seat', value: `${min} cm`, target: '75 cm around', state: min >= clearances.chairPullBack ? 'pass' : 'warn' });
  }

  return out;
}

export function planSummary(plan: Plan) {
  const all = plan.items.flatMap((i) => checksFor(plan, i).map((c) => ({ ...c, item: i })));
  const problems = all.filter((c) => c.state !== 'pass');
  const cost = plan.items.reduce((sum, i) => sum + productById(i.productId)!.price, 0);
  return { checks: all.length, passed: all.length - problems.length, problems, cost };
}
