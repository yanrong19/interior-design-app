// Spatial rules the knowledge base teaches and the planner checks. Figures in centimetres.
export interface SpatialRule {
  id: string;
  figure: string;
  unit: string;
  caption: string;
  detail: string;
}

export const clearances = {
  sofaToCoffeeMin: 40,
  sofaToCoffeeMax: 50,
  walkway: 90,
  doorSwing: 90,
  bedSide: 60,
  chairPullBack: 75,
} as const;

export const ruleTiles: SpatialRule[] = [
  { id: 'coffee', figure: '45', unit: 'cm', caption: 'Sofa to coffee table', detail: 'Close enough to reach a cup, far enough for knees: 40–50 cm.' },
  { id: 'walk', figure: '90', unit: 'cm', caption: 'Main walkway', detail: 'Two people pass at 90 cm. Minor paths can drop to 60 cm.' },
  { id: 'evening', figure: '2700', unit: 'K', caption: 'Evening light', detail: 'Warm white bulbs for living rooms and bedrooms after dark.' },
  { id: 'bed', figure: '60', unit: 'cm', caption: 'Beside a bed', detail: 'Room to make the bed and get out without climbing.' },
  { id: 'pendant', figure: '75', unit: 'cm', caption: 'Pendant over table', detail: 'From the table top to the bottom of the shade.' },
  { id: 'chair', figure: '75', unit: 'cm', caption: 'Behind a dining chair', detail: 'Pull out and stand up without hitting the wall.' },
  { id: 'rug', figure: '2/3', unit: '', caption: 'Seat on the rug', detail: 'At least the front legs of every seat sit on the rug.' },
  { id: 'art', figure: '145', unit: 'cm', caption: 'Centre of a picture', detail: 'From the floor to the centre of the artwork.' },
  { id: 'tv', figure: '1.5×', unit: '', caption: 'Screen to sofa', detail: 'Seat distance about 1.5 times the screen’s diagonal.' },
];
