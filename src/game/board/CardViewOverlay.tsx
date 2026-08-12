// src/components/game/CardViewOverlay.tsx
import React from 'react';
import { CardViewOverlayProps } from './board.types';
import { Card} from '../components/Card.tsx';
import './card.view.overlay.css';

export const CardViewOverlay: React.FC<CardViewOverlayProps> = ({
  title,
  cardsToShow,
  onAcknowledge,
  buttonText = 'Understood',
}) => {
  if (!cardsToShow || cardsToShow.length === 0) {
    return null;
  }

  return (
    <div className="card-view-overlay-backdrop">
      <div className="card-view-overlay-modal">
        <h2 className="overlay-view-title">{title}</h2>

        <div className="card-view-list">
          {cardsToShow.map((cardIt) => (
            <div key={cardIt.id} className="card-view-wrapper">
              <Card
                card={cardIt}
                isPlayable={false}
                onPlay={() => {}}
              />
            </div>
          ))}
        </div>

        <button className="overlay-acknowledge-button" onClick={onAcknowledge}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};
