# Zoo Deduce

A turn-based multiplayer deduction card game built with React, TypeScript, and native web APIs. Players compete against tactical AI opponents to deduce rival identities, execute animal abilities, and aim to be the last player standing.

---

## Game Parameters and Rules

* **Turn Mechanics**: At the start of a turn, players automatically draw a card from the deck. A player chooses a card from their hand, places it in the discard matrix, and immediately resolves its unique animal behavior.
* **Dual Victory Conditions**:
    1. **Last Player Standing**: Eliminate all other players via targeted deductions.
    2. **High-Value Showdown**: If the draw pile runs completely dry, surviving players reveal their hands. The player holding the highest value animal card wins.
* **Session Scale**: Customizable match configuration via the Main Menu lobby, allowing the user to select between 1 and 5 bot opponents.

---

## Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Clone the repository:
   git clone https://github.com
   cd zoo-deduce
2. Install project dependencies:
   npm install
3. Boot up the local hot-reloading development server:
   npm run dev

---

## Future Roadmap

- **Phase 1**: Finalize specific card resolution engines (resolveCardMechanic) for cards like the Owl, Beaver, and Rhino.
- **Phase 2**: Incorporate Favor Tokens currency tracking to persist match victories across multiple rounds.
- **Phase 3**: Implement native HTML5 Drag and Drop into a designated central Field Mat alongside universal click-to-inspect description popup overlays.
- **Phase 4**: Add a local multiplayer hot-seat mode utilizing the modular PlayerConfig architecture.
