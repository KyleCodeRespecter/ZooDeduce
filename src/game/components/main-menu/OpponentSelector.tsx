import React, { useState } from 'react';


interface BotCountSelectorProps {
  onBotCountChange: (count: number) => void;
}

export const BotCountSelector: React.FC<BotCountSelectorProps> = ({ onBotCountChange }) => {
  const [selectedBots, setSelectedBots] = useState<number>(2);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setSelectedBots(value);
    onBotCountChange(value);
  }
  return (
    <div>
      <label className="opponent-selection-title"> Number of Opponents</label>
      <select
        className="opponent-selection-dropdown"
        id="opponent-select"
        value={selectedBots}
        onChange={handleChange}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <option
            key={item}
            className="opponent-selection-item"
            id={`select-${item}`}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}