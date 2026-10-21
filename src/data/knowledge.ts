import type { StyleId } from './catalog';
import { photos } from './images';

export interface Hotspot {
  x: number; // % from left
  y: number; // % from top
  title: string;
  specs: [string, string][];
  productId?: string;
}

export type Block =
  | { type: 'text'; heading?: string; body: string[] }
  | { type: 'hotspots'; heading: string; photo: string; alt: string; pins: Hotspot[] }
  | { type: 'rules'; heading: string; rows: [string, string, string][] }
  | { type: 'matrix' }
  | { type: 'style'; styleId: StyleId };

export interface Article {
  id: string;
  group: 'Room types' | 'Styles' | 'Colour & light' | 'Spatial rules';
  title: string;
  summary: string;
  blocks: Block[];
}

export const articleGroups: Article['group'][] = ['Room types', 'Styles', 'Colour & light', 'Spatial rules'];

export const articles: Article[] = [
  {
    id: 'living-room',
    group: 'Room types',
    title: 'Living room',
    summary: 'Arrange around how people sit and talk, then add the screen, then the light.',
    blocks: [
      {
        type: 'hotspots',
        heading: 'Read this room',
        photo: photos.livingSectional,
        alt: 'A light living room with a grey sectional sofa, round coffee table and a gallery wall',
        pins: [
          { x: 66, y: 60, title: 'Corner sofa', specs: [['Seat depth', '58 cm'], ['Back to wall', '0 cm'], ['Faces', 'the window, not the door']], productId: 'bay-corner' },
          { x: 47, y: 79, title: 'Round coffee table', specs: [['Diameter', '80 cm'], ['Gap to sofa', '45 cm'], ['Height', '42 cm, 3 cm under the seat']], productId: 'nest-tables' },
          { x: 27, y: 30, title: 'Gallery wall', specs: [['Centre height', '145 cm'], ['Gap between frames', '5–8 cm'], ['Width', '2/3 of the sofa']] },
          { x: 14, y: 72, title: 'Accent chair', specs: [['Angle to sofa', '45°'], ['Conversation distance', 'under 240 cm']], productId: 'otto-chair' },
          { x: 72, y: 37, title: 'Wall paint', specs: [['Colour', 'Chalk white'], ['LRV', '88'], ['Finish', 'Matt']] },
        ],
      },
      {
        type: 'text',
        heading: 'Start with the conversation',
        body: [
          'Seats face each other within 240 cm so nobody raises their voice. A sofa and two chairs in a U is the most forgiving layout for a room between 12 and 20 m².',
          'Float the sofa off the wall when the room is wider than 4 m: a console behind it gives you a surface for a lamp and keeps the walkway behind.',
        ],
      },
      {
        type: 'rules',
        heading: 'Living room clearances',
        rows: [
          ['Sofa to coffee table', '40–50 cm', 'Reach without leaning'],
          ['Main walkway', '90 cm', 'Two people pass'],
          ['Chair to chair', '90–120 cm', 'Easy conversation'],
          ['Screen to seat', '1.5 × diagonal', 'A 55″ screen: 210 cm'],
        ],
      },
    ],
  },
  {
    id: 'bedroom',
    group: 'Room types',
    title: 'Bedroom',
    summary: 'The bed decides everything else. Place it first, on the wall you see from the door.',
    blocks: [
      {
        type: 'hotspots',
        heading: 'Read this room',
        photo: photos.bedroomWhite,
        alt: 'A white bedroom with an upholstered bed, bedside tables and a window on the right',
        pins: [
          { x: 45, y: 62, title: 'King bed', specs: [['Width', '186 cm'], ['Side clearance', '60 cm each side'], ['Foot clearance', '90 cm']], productId: 'wells-bed' },
          { x: 21, y: 54, title: 'Bedside table', specs: [['Height', 'level with the mattress top'], ['Width', '40–50 cm']] },
          { x: 76, y: 38, title: 'Window', specs: [['Curtain rail', '15 cm above the frame'], ['Overhang', '20 cm each side']] },
        ],
      },
      {
        type: 'rules',
        heading: 'Bedroom clearances',
        rows: [
          ['Beside the bed', '60 cm', 'Make the bed without climbing'],
          ['Foot of the bed', '90 cm', 'Walkway past the bed'],
          ['Wardrobe front', '100 cm', 'Doors open and you stand in front'],
        ],
      },
    ],
  },
  {
    id: 'kitchen',
    group: 'Room types',
    title: 'Kitchen',
    summary: 'Sink, hob and fridge within a few steps of each other, with nobody walking through the middle.',
    blocks: [
      {
        type: 'rules',
        heading: 'Kitchen clearances',
        rows: [
          ['Between counters', '105–120 cm', 'One cook; 120 cm for two'],
          ['Island overhang', '25–30 cm', 'Knee room for stools'],
          ['Stool width', '60 cm each', 'Elbow room at the counter'],
          ['Pendant over island', '75–85 cm', 'Top of counter to shade'],
        ],
      },
    ],
  },
  {
    id: 'dining',
    group: 'Room types',
    title: 'Dining',
    summary: 'Size the table to the room, not the other way round: leave 75 cm behind every chair.',
    blocks: [
      {
        type: 'hotspots',
        heading: 'Read this room',
        photo: photos.diningGreen,
        alt: 'A dining room with a white round table, green velvet chairs and a round mirror',
        pins: [
          { x: 50, y: 70, title: 'Dining table', specs: [['Per person', '60 cm of edge'], ['Height', '75 cm']], productId: 'lune-table' },
          { x: 33, y: 72, title: 'Velvet chair', specs: [['Seat height', '46 cm'], ['Behind chair', '75 cm to the wall']] },
          { x: 50, y: 18, title: 'Mirror', specs: [['Diameter', '90 cm'], ['Bottom edge', '30 cm above the sideboard']] },
        ],
      },
    ],
  },
  {
    id: 'style-matrix',
    group: 'Styles',
    title: 'Style matrix',
    summary: 'Four styles side by side: their colours, light and materials.',
    blocks: [{ type: 'matrix' }],
  },
  { id: 'japandi', group: 'Styles', title: 'Japandi', summary: 'Scandinavian comfort with Japanese restraint.', blocks: [{ type: 'style', styleId: 'japandi' }] },
  { id: 'mid-century', group: 'Styles', title: 'Mid-century modern', summary: 'Tapered legs, saturated upholstery, warm walnut.', blocks: [{ type: 'style', styleId: 'mid-century' }] },
  { id: 'industrial', group: 'Styles', title: 'Industrial', summary: 'Exposed structure softened with leather and wool.', blocks: [{ type: 'style', styleId: 'industrial' }] },
  { id: 'minimal', group: 'Styles', title: 'Minimal', summary: 'Few pieces, each chosen for use.', blocks: [{ type: 'style', styleId: 'minimal' }] },
  {
    id: 'colour-temperature',
    group: 'Colour & light',
    title: 'Colour temperature',
    summary: 'Measured in kelvin. Lower is warmer. Match the bulb to the hour, not the room.',
    blocks: [
      {
        type: 'rules',
        heading: 'Which bulb where',
        rows: [
          ['Evening living and bedroom', '2700 K', 'Warm white'],
          ['Kitchen worktops', '3000–4000 K', 'True colours for food'],
          ['Home office', '4000 K', 'Alert, neutral'],
          ['Bathroom mirror', '3000 K, CRI 90+', 'Skin tones read true'],
        ],
      },
      { type: 'text', heading: 'Daylight changes the paint', body: ['North light is cool and flat: warm whites and clay tones stop a room going grey. South light is warm all day, so cooler fogs and sages stay fresh.'] },
    ],
  },
  {
    id: 'layered-lighting',
    group: 'Colour & light',
    title: 'Layered lighting',
    summary: 'Three layers: ambient to see, task to work, accent to feel. Every room needs at least two.',
    blocks: [
      { type: 'text', body: ['Ambient light fills the room: a ceiling fitting or cove. Task light sits where hands work: a reading lamp 40 cm beside the shoulder, a pendant 75 cm over the table. Accent light picks out one thing: a picture, a plant, a textured wall.', 'Put each layer on its own switch or dimmer so the room can change from day to evening.'] },
    ],
  },
  {
    id: 'palette-60-30-10',
    group: 'Colour & light',
    title: 'The 60-30-10 palette',
    summary: 'Sixty percent main colour, thirty secondary, ten accent.',
    blocks: [
      { type: 'text', body: ['Walls and floor carry the 60. Large furniture and curtains carry the 30. Cushions, art and one chair carry the 10. When a room feels busy, check whether the accent has crept past a tenth.'] },
    ],
  },
  {
    id: 'clearances',
    group: 'Spatial rules',
    title: 'Clearances',
    summary: 'The gaps that make a room comfortable to move through. The planner checks these as you work.',
    blocks: [
      {
        type: 'rules',
        heading: 'Checked by the planner',
        rows: [
          ['Sofa to coffee table', '40–50 cm', 'Reach without leaning'],
          ['Main walkway', '90 cm', 'Two people pass'],
          ['In front of a door', '90 cm', 'Door swings clear'],
          ['Beside a bed', '60 cm', 'Make the bed'],
          ['Behind a dining chair', '75 cm', 'Stand up from the table'],
        ],
      },
    ],
  },
  {
    id: 'walkways',
    group: 'Spatial rules',
    title: 'Walkways',
    summary: 'Draw the paths before the furniture: door to window, door to seat, seat to kitchen.',
    blocks: [{ type: 'text', body: ['Main paths are 90 cm. Minor ones, such as the gap behind a chair you rarely pass, can drop to 60 cm. Never route a path between a sofa and its screen.'] }],
  },
  {
    id: 'rug-sizing',
    group: 'Spatial rules',
    title: 'Rug sizing',
    summary: 'Front legs of every seat on the rug; 20–45 cm of floor showing at the walls.',
    blocks: [
      {
        type: 'rules',
        heading: 'Common sizes',
        rows: [
          ['Living room, 3-seat sofa', '200 × 300 cm', 'Front legs on'],
          ['Under a king bed', '240 × 300 cm', '60 cm beyond each side'],
          ['Under a dining table', 'table + 60 cm each side', 'Chairs stay on when pulled out'],
        ],
      },
    ],
  },
];

export const articleById = (id: string) => articles.find((a) => a.id === id);
