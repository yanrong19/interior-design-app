import { photos } from './images';

export type Category = 'Seating' | 'Tables' | 'Storage' | 'Lighting' | 'Beds';
export type StyleId = 'japandi' | 'mid-century' | 'industrial' | 'minimal';

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** what the planner treats it as, for clearance rules */
  kind: 'sofa' | 'chair' | 'coffee-table' | 'table' | 'stool' | 'lamp' | 'storage' | 'bed';
  material: string;
  styles: StyleId[];
  /** centimetres */
  w: number;
  d: number;
  h: number;
  /** euros */
  price: number;
  photo: string;
  care: string;
  pairs: string[];
}

// Sample catalogue. Names, prices and dimensions are placeholders to replace with real stock.
export const products: Product[] = [
  {
    id: 'hale-sofa', name: 'Hale three-seat sofa', category: 'Seating', kind: 'sofa',
    material: 'Bottle-green velvet, oak legs', styles: ['mid-century'],
    w: 214, d: 92, h: 84, price: 1290, photo: photos.sofaGreen,
    care: 'Vacuum weekly with a soft brush. Blot spills; brush the pile in one direction while damp.',
    pairs: ['nest-tables', 'arc-lamp', 'otto-chair'],
  },
  {
    id: 'ardo-sofa', name: 'Ardo two-seat sofa', category: 'Seating', kind: 'sofa',
    material: 'Sand linen blend, ash frame', styles: ['japandi', 'minimal'],
    w: 186, d: 95, h: 78, price: 1040, photo: photos.sofaTan,
    care: 'Covers remove for a 30 °C wash. Air dry flat to keep the size.',
    pairs: ['tove-stool', 'lune-table', 'float-shelves'],
  },
  {
    id: 'rue-loveseat', name: 'Rue loveseat', category: 'Seating', kind: 'sofa',
    material: 'Rust wool, beech legs', styles: ['mid-century'],
    w: 162, d: 88, h: 82, price: 890, photo: photos.sofaOrange,
    care: 'Spot clean with wool detergent. Keep out of direct sun to hold the colour.',
    pairs: ['pell-chair-white', 'dome-pendant', 'nest-tables'],
  },
  {
    id: 'bay-corner', name: 'Bay corner sofa', category: 'Seating', kind: 'sofa',
    material: 'Oat bouclé, hidden plinth', styles: ['minimal', 'japandi'],
    w: 268, d: 190, h: 80, price: 2150, photo: photos.livingSectional,
    care: 'Bouclé snags: trim loose loops with scissors, never pull them.',
    pairs: ['nest-tables', 'arc-lamp', 'float-shelves'],
  },
  {
    id: 'otto-chair', name: 'Otto lounge chair', category: 'Seating', kind: 'chair',
    material: 'Mustard wool, walnut base', styles: ['mid-century'],
    w: 76, d: 82, h: 88, price: 540, photo: photos.livingYellowChair,
    care: 'Brush the wool monthly. Oil the walnut once a year.',
    pairs: ['arc-lamp', 'hale-sofa'],
  },
  {
    id: 'pell-chair', name: 'Pell side chair, black', category: 'Seating', kind: 'chair',
    material: 'Moulded polypropylene, beech', styles: ['industrial', 'minimal'],
    w: 47, d: 53, h: 82, price: 145, photo: photos.chairShell,
    care: 'Wipe with a damp cloth. Felt pads protect wooden floors.',
    pairs: ['lune-table', 'dome-pendant'],
  },
  {
    id: 'pell-chair-white', name: 'Pell side chair, white', category: 'Seating', kind: 'chair',
    material: 'Moulded polypropylene, beech', styles: ['minimal', 'japandi'],
    w: 47, d: 53, h: 82, price: 145, photo: photos.chairWhite,
    care: 'Wipe with a damp cloth. Felt pads protect wooden floors.',
    pairs: ['lune-table', 'tove-stool'],
  },
  {
    id: 'kip-stool', name: 'Kip bar stool', category: 'Seating', kind: 'stool',
    material: 'Black shell, oak legs, steel ring', styles: ['industrial'],
    w: 46, d: 46, h: 75, price: 120, photo: photos.stoolBar,
    care: 'Tighten the footring screws every six months.',
    pairs: ['dome-pendant'],
  },
  {
    id: 'tove-stool', name: 'Tove stool, ash', category: 'Seating', kind: 'stool',
    material: 'Whitewashed ash', styles: ['japandi', 'minimal'],
    w: 38, d: 38, h: 74, price: 95, photo: photos.stoolAsh,
    care: 'Soap-finished: wipe with a weak soap solution, never oil.',
    pairs: ['ardo-sofa', 'float-shelves'],
  },
  {
    id: 'lune-table', name: 'Lune round table', category: 'Tables', kind: 'table',
    material: 'White laminate top, oak legs', styles: ['minimal', 'japandi'],
    w: 80, d: 80, h: 75, price: 310, photo: photos.tableRound,
    care: 'Use mats under hot pans. Laminate cleans with any mild spray.',
    pairs: ['pell-chair-white', 'pell-chair', 'dome-pendant'],
  },
  {
    id: 'nest-tables', name: 'Nest coffee tables, pair', category: 'Tables', kind: 'coffee-table',
    material: 'Oak veneer', styles: ['japandi', 'mid-century'],
    w: 90, d: 60, h: 45, price: 260, photo: photos.sectionalDark,
    care: 'Coasters under glasses. Re-wax the oak twice a year.',
    pairs: ['hale-sofa', 'bay-corner'],
  },
  {
    id: 'arc-lamp', name: 'Arc floor lamp, graphite', category: 'Lighting', kind: 'lamp',
    material: 'Powder-coated steel, E27 bulb', styles: ['industrial', 'mid-century'],
    w: 30, d: 30, h: 152, price: 180, photo: photos.lampFloor,
    care: 'Use a 2700 K bulb for evening light; dust the shade monthly.',
    pairs: ['otto-chair', 'hale-sofa'],
  },
  {
    id: 'dome-pendant', name: 'Dome pendant', category: 'Lighting', kind: 'lamp',
    material: 'Matt white aluminium, 1.5 m cord', styles: ['minimal', 'industrial'],
    w: 38, d: 38, h: 24, price: 85, photo: photos.lampPendant,
    care: 'Hang 75 cm above a dining table top.',
    pairs: ['lune-table', 'kip-stool'],
  },
  {
    id: 'float-shelves', name: 'Float wall shelves, oak', category: 'Storage', kind: 'storage',
    material: 'Solid oak, concealed brackets', styles: ['japandi', 'minimal'],
    w: 120, d: 22, h: 18, price: 230, photo: photos.shelvesOak,
    care: 'Holds 15 kg per shelf when fixed to studs or masonry.',
    pairs: ['ardo-sofa', 'tove-stool'],
  },
  {
    id: 'wells-bed', name: 'Wells upholstered bed, king', category: 'Beds', kind: 'bed',
    material: 'Ivory linen, tufted headboard', styles: ['minimal'],
    w: 186, d: 218, h: 130, price: 1480, photo: photos.bedTufted,
    care: 'Vacuum the headboard seams; linen softens with use.',
    pairs: ['arc-lamp', 'tove-stool'],
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);

/* Rooms. Ids match the Knowledge Base article ids, so a room filter can link to its guide. */
export type RoomId = 'living-room' | 'bedroom' | 'kitchen' | 'dining';
export const rooms: { id: RoomId; label: string }[] = [
  { id: 'living-room', label: 'Living room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'dining', label: 'Dining' },
];

const roomsByKind: Record<Product['kind'], RoomId[]> = {
  sofa: ['living-room'],
  chair: ['living-room', 'dining'],
  'coffee-table': ['living-room'],
  table: ['dining', 'kitchen'],
  stool: ['kitchen', 'bedroom'],
  lamp: ['living-room', 'bedroom'],
  storage: ['living-room', 'bedroom'],
  bed: ['bedroom'],
};

/** Where a piece belongs when the kind alone would mislead (a bar stool is not for a bedroom). */
const roomOverrides: Record<string, RoomId[]> = {
  'otto-chair': ['living-room', 'bedroom'],
  'pell-chair': ['dining', 'kitchen'],
  'pell-chair-white': ['dining', 'kitchen'],
  'kip-stool': ['kitchen'],
  'dome-pendant': ['kitchen', 'dining'],
};

export const productRooms = (p: Product): RoomId[] => roomOverrides[p.id] ?? roomsByKind[p.kind];

export const categories: Category[] = ['Seating', 'Tables', 'Storage', 'Lighting', 'Beds'];

export const formatPrice = (n: number) =>
  `€${n.toLocaleString('en-IE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
