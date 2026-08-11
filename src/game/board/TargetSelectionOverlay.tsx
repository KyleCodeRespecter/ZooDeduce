// src/components/game/TargetSelectionOverlay.tsx
import React, { useEffect, useState } from 'react';
import { useActiveGameState } from '../../engine/game.engine.context.ts';
import { getCardDescription } from '../../engine/utils/card.utils';
import { CardType } from '../../types/game.types.ts';
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

  const validOpponents = gameState.players.filter((opponent) =>
    request?.validTargetIds.includes(opponent.id),
  );

  const guessOptions = Object.keys(CardType)
    .map((key) => Number(key))
    .filter((value) => !isNaN(value) && value !== CardType.Meerkat);

  const targetIdsSignature = request?.validTargetIds.join(',') ?? '';

  // 1v1 Auto-Selection Guard
  useEffect(() => {
    if (!request || !playedCard || !targetIdsSignature) return;

    const hasSingleTarget = validOpponents.length === 1;
    const isNotRhino = playedCard.type !== CardType.Rhino;

    if (hasSingleTarget && isNotRhino) {
      if (request.requiresGuess) {
        setSelectedOpponentId(validOpponents[0].id);
      } else {
        selectTargetAction(validOpponents[0].id);
      }
    }
  }, [
    targetIdsSignature,
    playedCard,
    request?.requiresGuess,
    selectTargetAction,
  ]);

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

  const isShowingGuessForm =
    request.requiresGuess && selectedOpponentId !== null;
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
            burnedCards={gameState.burnedCards}
          />
        </div>
      </div>
    );
  }

  // Rhino allows for self targeting
  const isNotRhino = playedCard?.type !== CardType.Rhino;
  if (validOpponents.length === 1 && isNotRhino) {
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
