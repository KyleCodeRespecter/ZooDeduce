import React from 'react';
import { CardType, TOTAL_CARD_DISTRIBUTION } from '../../types/game.types';

interface GuessPickerProps {
  targetName: string;
  guessOptions: number[];
  selectedCardType: number | null;
  onSelectCardType: (type: number) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  // Passing the collective histories to audit card availability counts
  allPublicDiscards: CardType[];
}

export function GuessPicker({
  targetName,
  guessOptions,
  selectedCardType,
  onSelectCardType,
  onSubmit,
  allPublicDiscards,
}: GuessPickerProps) {
  // Rule matrix matching your createFreshDeck totals
  const totalCardCounts: Record<CardType, number> = TOTAL_CARD_DISTRIBUTION;

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
            const maxAllowed = totalCardCounts[typeCode as CardType] || 0;

            const isOptionExhausted = discardCount >= maxAllowed;

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
                  {CardType[typeCode]}
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
