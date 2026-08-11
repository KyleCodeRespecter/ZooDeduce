import React from 'react';
import { CardType } from '../../types/game.types';

interface GuessPickerProps {
  targetName: string;
  guessOptions: number[];
  selectedCardType: number | null;
  onSelectCardType: (type: number) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  // Passing the collective histories to audit card availability counts
  allPublicDiscards: CardType[];
  burnedCards: any[];
}

export function GuessPicker({
  targetName,
  guessOptions,
  selectedCardType,
  onSelectCardType,
  onSubmit,
  allPublicDiscards,
  burnedCards,
}: GuessPickerProps) {
  // Rule matrix matching your createFreshDeck totals
  const totalCardCounts: Record<CardType, number> = {
    [CardType.Peacock]: 1,
    [CardType.Tiger]: 1,
    [CardType.Lion]: 1,
    [CardType.Beaver]: 2,
    [CardType.Rhino]: 2,
    [CardType.Chameleon]: 2,
    [CardType.StagBeetle]: 2,
    [CardType.Owl]: 2,
    [CardType.Meerkat]: 6,
  };

  return (
    <>
      <h3 className="target-overlay-title">Meerkat Guess Tracking</h3>
      <p className="target-overlay-subtitle">Targeting: {targetName}</p>
      <p className="target-overlay-prompt">
        What card do you deduce they hold?
      </p>

      <form onSubmit={onSubmit} className="guess-radio-form">
        <div className="radio-options-grid">
          {guessOptions.map((typeCode) => {
            // Count copies currently sitting publicly visible in active discard arrays
            const discardCount = allPublicDiscards.filter(
              (type) => type === typeCode,
            ).length;
            // Count copies sitting visible inside the public burned card array tracks
            const burnCount = burnedCards.filter(
              (card) => card.type === typeCode,
            ).length;

            const totalSeen = discardCount + burnCount;
            const maxAllowed = totalCardCounts[typeCode as CardType] || 0;

            // 🔥 BONUS OBJECTIVE: If all copies are seen, it's an impossible choice! Disable it!
            const isOptionExhausted = totalSeen >= maxAllowed;

            return (
              <label
                key={typeCode}
                className={`radio-card-label ${selectedCardType === typeCode ? 'checked' : ''} ${isOptionExhausted ? 'exhausted' : ''}`}
              >
                <input
                  type="radio"
                  name="cardGuess"
                  value={typeCode}
                  disabled={isOptionExhausted}
                  checked={selectedCardType === typeCode}
                  onChange={() => onSelectCardType(typeCode)}
                  className="hidden-radio-input"
                />
                <span className="radio-card-text">
                  {CardType[typeCode]} {isOptionExhausted && '(All Seen)'}
                </span>
              </label>
            );
          })}
        </div>

        <button
          type="submit"
          className="target-player-button guess-submit-btn"
          disabled={selectedCardType === null}
        >
          Commit Deduction Guess
        </button>
      </form>
    </>
  );
}
