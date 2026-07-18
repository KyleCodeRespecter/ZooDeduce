export enum CardType {
  Princess = 9,
  Countess = 8,
  King = 7,
  Chancellor = 6,
  Prince = 5,
  Handmaid = 4,
  Baron = 3,
  Priest = 2,
  Guard = 1,
}


export interface CardData {
  id: string; // Unique instance ID generated via crypto.randomUUID()
  type: CardType;
}

// interface CardProps {
//   card: CardData;
// }
//
// export function Card({ card }: CardProps) {
//   // card.type is a number (e.g., 8)
//   // CardType[card.type] turns that number into a string (e.g., "Princess")
//   const cardName = CardType[card.type];
//
//   return (
//     <div className={`card rank-${card.type}`}>
//   <h3>{cardName}</h3>
//   <div className="value-badge">{card.type}</div>
//     </div>
// );
// }

