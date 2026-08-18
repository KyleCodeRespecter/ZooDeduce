// src/components/game/TargetSelectionOverlay.tsx
import React, { useEffect, useState } from 'react';
import { useActiveGameState } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils';
import { CardType } from '../../types/card.types.ts';
import { OpponentPicker } from '../components/OpponentPicker';
import { GuessPicker } from '../components/GuessPicker';
import './opponent.selection.overlay.css';

export function TargetSelectionOverlay() {
  const { gameState, selectTargetAction, playCardAction } =
    useActiveGameState();
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null,
  );
  const [selectedCardType, setSelectedCardType] = useState<number | null>(null);

  const request = gameState.activeTargetRequest;
  const player = gameState.players[gameState.currentPlayerIndex];
  const playedCard = player.hand.find((card) => card.id === request?.cardId);

  const cardName = playedCard ? CardType[playedCard.type] : 'Card';
  const cardDescription = playedCard ? getCardDescription(playedCard.type) : '';

  const isNotRhino = playedCard?.type !== CardType.Rhino;

  const validOpponents = gameState.players.filter((opponent) =>
    request?.validTargetIds.includes(opponent.id),
  );

  const guessOptions = Object.keys(CardType)
    .map((key) => Number(key))
    .filter((value) => !isNaN(value) && value !== CardType.Meerkat);

  const targetIdsSignature = request?.validTargetIds.join(',') ?? '';

  // 1v1 Auto-Selection Guard
  useEffect(() => {
    // 1. Safe boundary safeguards
    if (!request || !targetIdsSignature || !request.validTargetIds) return;

    const targetIdsArray = request.validTargetIds;

    // 2. Mathematically check the array length directly from the stable request packet
    const hasSingleTarget = targetIdsArray.length === 1;

    if (hasSingleTarget && isNotRhino) {
      // 3. Extract the clean string item node out of index 0 safely
      const loneOpponentId = targetIdsArray[0];

      if (request.requiresGuess) {
        // Auto-lock the target string safely, bypassing unstable player filtering arrays
        setSelectedOpponentId(loneOpponentId);
      } else {
        selectTargetAction(loneOpponentId);
      }
    }
  }, [targetIdsSignature, request, isNotRhino, selectTargetAction]);

  if (!request || !gameState) return null;

  const handleGuessSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedOpponentId && selectedCardType !== null) {
      playCardAction(request.cardId, selectedOpponentId, selectedCardType);
      setSelectedOpponentId(null);
      setSelectedCardType(null);
    }
  };

  const allPublicDiscards = gameState.players.flatMap((p) => p.discardPile);

  // Check visibility flags using an airtight comparison
  const isShowingGuessForm =
    request.requiresGuess && selectedOpponentId !== null;

  // Safe lookup: Defends against missing player mappings with a standard text fallback
  const targetName =
    gameState.players.find((p) => p.id === selectedOpponentId)?.name ||
    'Opponent';

  if (isShowingGuessForm) {
    return (
      <div className="target-overlay-backdrop">
        <div className="target-overlay-modal">
          <GuessPicker
            targetName={targetName}
            guessOptions={guessOptions}
            selectedCardType={selectedCardType}
            onSelectCardType={setSelectedCardType}
            onSubmit={handleGuessSubmit}
            allPublicDiscards={allPublicDiscards}
          />
        </div>
      </div>
    );
  }

  // Flash protection guard (Only hides standard non-guessing cards in 1v1 matches)
  if (validOpponents.length === 1 && isNotRhino && !request.requiresGuess) {
    return null;
  }

  return (
    <div className="target-overlay-backdrop">
      <div className="target-overlay-modal">
        <OpponentPicker
          cardName={cardName}
          cardDescription={cardDescription}
          validOpponents={validOpponents}
          onSelect={(id) => {
            if (request.requiresGuess) {
              setSelectedOpponentId(id);
            } else {
              selectTargetAction(id);
            }
          }}
        />
      </div>
    </div>
  );
}
