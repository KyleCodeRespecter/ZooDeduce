export enum CardType {
  Peacock = 9,
  Tiger = 8,
  Lion = 7,
  Beaver = 6,
  Rhino = 5,
  Chameleon = 4,
  StagBeetle = 3,
  Owl = 2,
  Meerkat = 1,
}

export interface CardData {
  id: string;
  type: CardType;
  requiresTarget: boolean;
}