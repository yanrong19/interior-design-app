import type { StyleId } from './catalog';

export type MaterialGroup = 'Floor' | 'Walls' | 'Fabric';

export interface Material {
  id: string;
  group: MaterialGroup;
  name: string;
  hex: string;
  /** a second tone used for the swatch's grain or weave */
  grain?: string;
  pattern: 'plain' | 'plank' | 'weave' | 'speckle';
  styles: StyleId[];
  note: string;
}

export const materials: Material[] = [
  { id: 'oak', group: 'Floor', name: 'Natural oak', hex: '#C8A27A', grain: '#B88F66', pattern: 'plank', styles: ['japandi', 'minimal', 'mid-century'], note: 'Wide boards, matt oil' },
  { id: 'ash', group: 'Floor', name: 'Pale ash', hex: '#E2D3BC', grain: '#D4C2A6', pattern: 'plank', styles: ['japandi', 'minimal'], note: 'Whitewashed, hides dust' },
  { id: 'walnut', group: 'Floor', name: 'Walnut', hex: '#6B4A33', grain: '#5A3D2A', pattern: 'plank', styles: ['mid-century'], note: 'Shows scratches; rugs in walkways' },
  { id: 'terrazzo', group: 'Floor', name: 'Grey terrazzo', hex: '#D9D6D0', grain: '#9E9A92', pattern: 'speckle', styles: ['mid-century', 'minimal'], note: 'Cold underfoot without heating' },
  { id: 'concrete', group: 'Floor', name: 'Polished concrete', hex: '#A9A8A4', grain: '#9A9995', pattern: 'speckle', styles: ['industrial', 'minimal'], note: 'Seal every 3 years' },
  { id: 'chalk', group: 'Walls', name: 'Chalk white', hex: '#F4F2EE', pattern: 'plain', styles: ['minimal', 'japandi'], note: 'LRV 88, brightens north rooms' },
  { id: 'sage', group: 'Walls', name: 'Sage', hex: '#B7C0AE', pattern: 'plain', styles: ['japandi', 'mid-century'], note: 'LRV 52, calm in bedrooms' },
  { id: 'fog', group: 'Walls', name: 'Fog blue', hex: '#C9D2D8', pattern: 'plain', styles: ['minimal'], note: 'LRV 63, cool in south light' },
  { id: 'clay', group: 'Walls', name: 'Clay pink', hex: '#D9B8A8', pattern: 'plain', styles: ['mid-century', 'japandi'], note: 'LRV 49, warm in north light' },
  { id: 'graphite', group: 'Walls', name: 'Graphite', hex: '#3A3B3C', pattern: 'plain', styles: ['industrial'], note: 'LRV 7, one wall at most' },
  { id: 'boucle', group: 'Fabric', name: 'Ivory bouclé', hex: '#EDE8DF', grain: '#DCD5C8', pattern: 'weave', styles: ['japandi', 'minimal'], note: 'Snags on pet claws' },
  { id: 'velvet', group: 'Fabric', name: 'Bottle velvet', hex: '#1F4A3D', grain: '#173A30', pattern: 'weave', styles: ['mid-century'], note: '40,000 rubs, fades in sun' },
  { id: 'linen', group: 'Fabric', name: 'Sand linen', hex: '#D8CBB5', grain: '#C9BAA1', pattern: 'weave', styles: ['japandi', 'minimal'], note: 'Creases; washable covers' },
  { id: 'wool', group: 'Fabric', name: 'Rust wool', hex: '#A2512E', grain: '#8C4426', pattern: 'weave', styles: ['mid-century', 'industrial'], note: 'Naturally stain-resistant' },
  { id: 'leather', group: 'Fabric', name: 'Tan leather', hex: '#A4744B', grain: '#8F633E', pattern: 'plain', styles: ['industrial', 'mid-century'], note: 'Condition twice a year' },
];

export const materialById = (id: string) => materials.find((m) => m.id === id);
