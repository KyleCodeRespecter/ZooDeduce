import { CardData, CardType } from '../../types/game.types';
import './card.css'

// Define the "Parameters" interface for this component (similar to a function signature)
interface CardProps {
  card: CardData;
  isPlayable: boolean;
  onPlay: (cardId: string) => void;
}

export function Card({ card, isPlayable, onPlay }: CardProps) {
  const cardName = CardType[card.type];
  // 2. Compute a clean CSS class name based on the enum value for custom styling per card type
  const cardStyleClass = `card-theme-${cardName.toLowerCase()}`;

  return (
    <div
      className={`card-component ${cardStyleClass} ${isPlayable ? 'playable' : 'disabled'}`}
    >
      {/* The top-corner numerical value badge */}
      <div className="card-value-badge">{card.type}</div>

      {/* Card Core Content */}
      <div className="card-body">
        <h2 className="card-title">{cardName}</h2>
        <p className="card-description">{getCardDescription(card.type)}</p>
      </div>

      {/* Conditional UI Rendering: Only show the play action if it's currently allowed */}
      {isPlayable && (
        <button className="play-card-button" onClick={() => onPlay(card.id)}>
          Play Card
        </button>
      )}
    </div>
  );
}

function getCardDescription(type: CardType): string {
  switch (type) {
    case CardType.Peacock:
      return 'If you discard this card, you are out of the round.';
    case CardType.Tiger:
      return 'If you have this card and the Lion or Rhino in your hand, you must discard this card.';
    case CardType.Lion:
      return 'Trade hands with another player of your choice.';
    case CardType.Rhino:
      return 'Choose any player (including yourself) to discard their hand and draw a new card.';
    case CardType.Chameleon:
      return "Until your next turn, ignore all effects from other players' cards.";
    case CardType.StagBeetle:
      return 'You and another player secretly compare hands. The player with the lower value is out.';
    case CardType.Owl:
      return "Look at another player's hand.";
    case CardType.Meerkat:
      return "Guess a player's hand (excluding Meerkat). If correct, that player is out.";
    case CardType.Beaver:
      return 'Draw 2 cards. Keep 1, and place the other 2 on the bottom of the deck.';
    default:
      return 'Unknown card influence rule.';
  }
}
