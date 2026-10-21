import type { StyleId } from './catalog';
import { photos } from './images';

export interface DesignStyle {
  id: StyleId;
  name: string;
  summary: string;
  palette: { name: string; hex: string }[];
  lighting: string;
  materials: string[];
  avoid: string;
  inspiration: { photo: string; caption: string; principles: string[]; products: string[] }[];
}

export const designStyles: DesignStyle[] = [
  {
    id: 'japandi',
    name: 'Japandi',
    summary: 'Scandinavian comfort with Japanese restraint: low furniture, pale wood, few objects.',
    palette: [
      { name: 'Rice paper', hex: '#EFEAE2' },
      { name: 'Ash', hex: '#D9CBB4' },
      { name: 'Moss', hex: '#7A8466' },
      { name: 'Sumi', hex: '#2B2A28' },
    ],
    lighting: 'Warm 2700 K, paper shades, light kept below eye level.',
    materials: ['Ash and oak', 'Linen', 'Paper', 'Stoneware'],
    avoid: 'Gloss finishes and more than one statement piece per room.',
    inspiration: [
      { photo: photos.livingBoucle, caption: 'Low seating, round forms', principles: ['Keep seat height under 42 cm', 'Repeat one curve three times'], products: ['bay-corner', 'tove-stool'] },
      { photo: photos.roomMinimal, caption: 'One plant, one lamp', principles: ['Leave a third of each wall empty', 'One tall object per corner'], products: ['ardo-sofa', 'float-shelves'] },
      { photo: photos.livingPlants, caption: 'Daylight first', principles: ['Sheer linen over blinds', 'Rug in the floor’s own tone'], products: ['ardo-sofa', 'lune-table'] },
    ],
  },
  {
    id: 'mid-century',
    name: 'Mid-century modern',
    summary: 'Tapered legs, saturated upholstery and warm walnut, from the 1950s and 60s.',
    palette: [
      { name: 'Walnut', hex: '#6B4A33' },
      { name: 'Mustard', hex: '#D4A13A' },
      { name: 'Bottle green', hex: '#1F4A3D' },
      { name: 'Cream wall', hex: '#F1EBDF' },
    ],
    lighting: 'Arc floor lamps and globe pendants, 2700–3000 K.',
    materials: ['Walnut', 'Velvet and wool', 'Brass', 'Terrazzo'],
    avoid: 'Matching sets: mix one saturated piece with neutral ones.',
    inspiration: [
      { photo: photos.livingYellowChair, caption: 'One saturated chair', principles: ['Accent colour on one piece only', 'Lamp arcs over the seat, not the walkway'], products: ['otto-chair', 'arc-lamp'] },
      { photo: photos.sofaOrange, caption: 'Rust against green', principles: ['Pair complementary colours at low saturation'], products: ['rue-loveseat', 'nest-tables'] },
      { photo: photos.diningGreen, caption: 'Velvet at the table', principles: ['75 cm behind each chair', 'Pendant 75 cm above the top'], products: ['lune-table', 'dome-pendant'] },
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial',
    summary: 'Exposed structure, brick and steel, softened with leather and wool.',
    palette: [
      { name: 'Brick', hex: '#8C4B37' },
      { name: 'Graphite', hex: '#3A3B3C' },
      { name: 'Concrete', hex: '#A9A8A4' },
      { name: 'Tan leather', hex: '#A4744B' },
    ],
    lighting: 'Bare bulbs and metal shades on dimmers, 2200–2700 K at night.',
    materials: ['Blackened steel', 'Reclaimed wood', 'Leather', 'Concrete'],
    avoid: 'Cold light: hard surfaces need warm bulbs to feel lived in.',
    inspiration: [
      { photo: photos.loftLiving, caption: 'Loft with zones', principles: ['A rug defines each zone', '90 cm paths between zones'], products: ['pell-chair', 'arc-lamp'] },
      { photo: photos.kitchenWhite, caption: 'Island seating', principles: ['Stool seat 25–30 cm below the counter', '60 cm width per stool'], products: ['kip-stool', 'dome-pendant'] },
      { photo: photos.sectionalDark, caption: 'Dark sofa, light floor', principles: ['Contrast the largest piece with the floor'], products: ['bay-corner', 'nest-tables'] },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    summary: 'Few pieces, each chosen for use. White walls, hidden storage, nothing on the floor that does not need to be there.',
    palette: [
      { name: 'Chalk', hex: '#F4F2EE' },
      { name: 'Fog', hex: '#C9D2D8' },
      { name: 'Oak', hex: '#C8A27A' },
      { name: 'Charcoal', hex: '#3A3B3C' },
    ],
    lighting: 'Recessed and indirect, 3000 K by day, dimmable.',
    materials: ['Painted plaster', 'Pale oak', 'Cotton', 'Matt steel'],
    avoid: 'Open shelving full of objects; close it or clear it.',
    inspiration: [
      { photo: photos.bedroomWhite, caption: 'A bed and two lamps', principles: ['60 cm each side of the bed', 'Bedside lamps at shoulder height'], products: ['wells-bed', 'arc-lamp'] },
      { photo: photos.livingBright, caption: 'Window as the feature', principles: ['Keep furniture below the sill line'], products: ['ardo-sofa', 'lune-table'] },
      { photo: photos.livingCoffered, caption: 'Symmetry', principles: ['Centre the sofa on the room’s main axis'], products: ['bay-corner', 'nest-tables'] },
    ],
  },
];

export const styleById = (id: StyleId) => designStyles.find((s) => s.id === id)!;
