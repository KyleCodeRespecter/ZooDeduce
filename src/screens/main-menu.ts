export function renderMainMenu(
  appElement: HTMLElement,
  onStartGame: () => void,
) {
  // 1. Clear previous content
  appElement.innerHTML = '';

  // 2. Create the container element
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-screen';

  // 3. Inject the static text content
  menuContainer.innerHTML = `
    <h1>Love Letter</h1>
    <p>A game of risk, deduction, and luck.</p>
  `;

  // 4. Create the button programmatically
  const startButton = document.createElement('button');
  startButton.textContent = 'Play Game';

  // Attach the event listener directly to the object reference!
  startButton.addEventListener('click', onStartGame);

  // 5. Assemble the UI tree
  menuContainer.appendChild(startButton);
  appElement.appendChild(menuContainer);
}
