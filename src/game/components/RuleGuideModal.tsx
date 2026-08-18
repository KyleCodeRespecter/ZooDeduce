// src/components/game/RulesGuideModal.tsx
import React, { useState } from 'react';
import { CardType } from '../../types/game.types';
import { getCardDescription } from '../../engine/utils/card.utils.ts';
import './rule.guide.css';
import '../../ultils/button.styles.css';

interface RulesGuideModalProps {
  onClose: () => void;
}

const CARD_METADATA_REGISTRY: Record<
  CardType,
  { name: string; cssKey: string; value: number }
> = {
  [CardType.Peacock]: { name: 'Peacock', cssKey: 'peacock', value: 9 },
  [CardType.Tiger]: { name: 'Tiger', cssKey: 'tiger', value: 8 },
  [CardType.Lion]: { name: 'Lion', cssKey: 'lion', value: 7 },
  [CardType.Beaver]: { name: 'Beaver', cssKey: 'beaver', value: 6 },
  [CardType.Rhino]: { name: 'Rhino', cssKey: 'rhino', value: 5 },
  [CardType.Chameleon]: { name: 'Chameleon', cssKey: 'chameleon', value: 4 },
  [CardType.StagBeetle]: {
    name: 'Stag Beetle',
    cssKey: 'stagbeetle',
    value: 3,
  },
  [CardType.Owl]: { name: 'Owl', cssKey: 'owl', value: 2 },
  [CardType.Meerkat]: { name: 'Meerkat', cssKey: 'meerkat', value: 1 },
};

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'gameplay'>('cards');

  return (
    <div className="rules-guide-backdrop" onClick={onClose}>
      <div
        className="rules-guide-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rules-modal-header">
          <h2 className="overlay-view-title">Zoo Deduce Codex</h2>
          <div className="rules-tab-bar">
            <button
              className={`rules-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              Animal Index
            </button>
            <button
              className={`rules-tab-btn ${activeTab === 'gameplay' ? 'active' : ''}`}
              onClick={() => setActiveTab('gameplay')}
            >
              How To Play
            </button>
          </div>
        </div>

        <div className="rules-scroll-container">
          {activeTab === 'cards' && (
            <div className="cards-tab-view">
              {Object.entries(CARD_METADATA_REGISTRY).map(([typeKey, meta]) => {
                const cardType = Number(typeKey) as CardType;
                const continuousRuleText = getCardDescription(cardType);

                return (
                  <div
                    key={cardType}
                    className="rule-card-row"
                    style={{ borderLeftColor: `var(--color-${meta.cssKey})` }}
                  >
                    <div
                      className="rule-value-block-badge"
                      style={{
                        backgroundColor: `var(--bg-${meta.cssKey})`,
                        color: `var(--color-${meta.cssKey})`,
                        border: `1px solid var(--color-${meta.cssKey})`,
                      }}
                    >
                      {meta.value}
                    </div>

                    <div className="rule-card-body-text">
                      <h4
                        className="rule-animal-name"
                        style={{ color: `var(--color-${meta.cssKey})` }}
                      >
                        {meta.name}
                      </h4>
                      <p className="rule-effect-description">
                        {continuousRuleText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'gameplay' && (
            <div className="gameplay-tab-view">
              <div className="gameplay-guide-section">
                <h3>Core Game Loop</h3>
                <p>
                  Every player starts the round holding exactly{' '}
                  <strong>1 hidden card</strong> in their hand. On your turn,
                  you draw a second card from the deck and select 1 card to play
                  face-up into your Discard Zone to execute its unique ability.
                </p>
              </div>

              <div className="gameplay-guide-section victory-box">
                <h3>How To Win</h3>
                <p>A round can end in two distinct ways:</p>
                <ul>
                  <li>
                    <strong>Last Man Standing:</strong> Use aggressive animal
                    strikes (like the Meerkat guess or a Stag Beetle Showdown)
                    to completely eliminate your rivals. If all other players
                    are knocked out, you win instantly.
                  </li>
                  <li>
                    <strong>The Final Showdown:</strong> If the draw deck runs
                    entirely out of cards before players are eliminated,
                    everyone reveals their single remaining hidden hand card.
                    The player holding the <strong>highest card value</strong>{' '}
                    wins the match!
                  </li>
                </ul>
              </div>

              <div className="gameplay-guide-section">
                <h3>Strategy & Deduction</h3>
                <p>
                  The deck is constructed of 6 Meerkats, 2 Owls, 2 Stag Beetles,
                  2 Chameleons, 2 Rhinos, 2 Beavers, 1 Lion, 1 Tiger, and 1
                  Peacock. 1 card is discarded and remains unknown at the start
                  of the round (1v1 games burn 3 additional cards). You will want
                  to try to deduce cards from opponents and perform elimination
                  moves.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          className="overlay-acknowledge-button"
          onClick={onClose}
          style={{ marginTop: '0.5rem' }}
        >
          Back to Battle
        </button>
      </div>
    </div>
  );
};
