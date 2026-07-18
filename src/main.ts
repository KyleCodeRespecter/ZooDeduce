import { renderMainMenu } from './screens/main-menu';

// Grab the placeholder div from index.html
const app = document.getElementById('game-app');

function initGame() {
  if (!app) return;

  // Load the main menu.
  // We pass a function telling it what to do when the "Play" button is clicked.
  renderMainMenu(app, () => {
    startGameplay();
  });
}

function startGameplay() {
  if (!app) return;

  // Wipe the screen and show gameplay text!
  // Eventually, you will replace this with a call to a 'gameplay.ts' file
  app.innerHTML = `
        <div class="game-screen">
            <h2>The Game Has Started!</h2>
            <p>Cards are being dealt...</p>
        </div>
    `;
}

// Start the game loop when the webpage loads
initGame();
