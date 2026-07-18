// MainMenu.tsx
interface MainMenuProps {
  onStartGame: () => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  // Look mom, no DOM manipulation, no IDs, no selectors!
  return (
    <div className="menu-screen">
      <h1>Love Letter</h1>
      <p>A game of risk, deduction, and luck.</p>
      <button onClick={onStartGame}>Play Game</button>
    </div>
  );
}
