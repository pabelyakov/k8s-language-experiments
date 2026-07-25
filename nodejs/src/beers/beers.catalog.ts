export interface Beer {
  id: number;
  name: string;
}

/** Hardcoded nominees shared by beers list, votes, and results. */
export const BEERS: readonly Beer[] = Object.freeze([
  { id: 1, name: 'Pilsner Urquell' },
  { id: 2, name: 'Guinness Draught' },
  { id: 3, name: 'Heineken' },
  { id: 4, name: 'Budweiser Budvar' },
  { id: 5, name: 'Hoegaarden' },
  { id: 6, name: 'Paulaner Hefe-Weißbier' },
  { id: 7, name: 'Sierra Nevada Pale Ale' },
  { id: 8, name: 'BrewDog Punk IPA' },
  { id: 9, name: 'Chimay Blue' },
  { id: 10, name: 'Baltic Porter (local)' },
]);

const BY_ID = new Map(BEERS.map((beer) => [beer.id, beer]));

export function listBeersSortedById(): Beer[] {
  return [...BEERS].sort((a, b) => a.id - b.id);
}

export function findBeerById(id: number): Beer | undefined {
  return BY_ID.get(id);
}

export function beerExists(id: number): boolean {
  return BY_ID.has(id);
}
