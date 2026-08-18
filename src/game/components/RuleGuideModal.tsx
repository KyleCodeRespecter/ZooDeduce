import React from 'react';
import { CardType } from '../../types/game.types';
import { getCardDescription } from '../../engine/utils/card.utils.ts';
import './rule.guide.css'

interface RuleGuideModalProps {
  onClose: () => void;
}

const CARD_METADATA_REGISTRY: Record<
  CardType,
  { name: string; cssKey: string; value: number }
> = {
  [CardType.Peacock]: { name: 'Peacock', cssKey: 'peacock', value: 9},
  [CardType.Tiger]: { name: 'Tiger', cssKey: 'tiger', value: 8},
  [CardType.Lion]: { name: 'Lion', cssKey: 'lion', value: 7},
  [CardType.Beaver]: { name: 'Beaver', cssKey: 'beaver', value: 6},
  [CardType.Rhino]: { name: 'Rhino', cssKey: 'rhino', value: 5},
  [CardType.Chameleon]: { name: 'Chameleon', cssKey: 'chameleon', value: 4},
  [CardType.StagBeetle]: { name: 'Stag Beetle', cssKey: 'stagbeetle', value: 3},
  [CardType.Owl]: { name: 'Owl', cssKey: 'owl', value: 2},
  [CardType.Meerkat]: { name: 'Meerkat', cssKey: 'meerkat', value: 1},
};


export const RulesGuideModal: React.FC<RuleGuideModalProps> = ({onClose}) => {
  return (
    <div
      className="card-view-overlay-backdrop rules-backdrop"
      onClick={onClose}
    >
      <div
        className="card-view-overlay-modal rules-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="overlay-view-title"
        >
          Zoo Deduce Encyclopedia
        </h2>

        <div className="rules-scroll-container">
          {Object.entries(CARD_METADATA_REGISTRY).map(([typeKey, meta]) => {
            const cardType = Number(typeKey) as CardType;
            const continuousRuleText = getCardDescription(cardType);

            return (
              <div
                key={cardType}
                className="rule-card-row"
                style={{
                  borderLeftColor: `var(--color-${meta.cssKey})`,
                  backgroundColor: `rgba(255, 255, 255, 0.02)`,
                }}
              >
                <div className="rule-row-header">
                  <span
                    className="rule-animal-name"
                    style={{ color: `var(--color-${meta.cssKey})` }}
                  >
                    {meta.name}
                  </span>
                  <span className="rule-value-tag">Value: {meta.value}</span>
                </div>
                <p className="rule-effect-description">{continuousRuleText}</p>
              </div>
            );
          })}
        </div>

        <button
          className="overlay-acknowledge-button"
          onClick={onClose}
        >
          Back to Battle
        </button>
      </div>
    </div>
  );
}