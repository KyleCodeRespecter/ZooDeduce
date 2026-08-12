# Zoo Deduce

A turn-based multiplayer deduction card game built with React, TypeScript, and native web APIs. Players compete against AI opponents to deduce their rivals identities. The winner is either the last player standing, or the player with the highest value card at the end. Players with equal value cards at the end of the round are both considered winners.

---

## Game Parameters and Rules

* **Turn Mechanics**: At the start of a turn, players automatically draw a card from the deck. A player chooses a card from their hand to play.
* **Dual Victory Conditions**:
    1. **Last Player Standing**: Eliminate all other players via targeted deductions.
    2. **High-Value Showdown**: Once the draw pile is empty on card draw, surviving players reveal their hands. The player(s) holding the highest value animal card wins.
* **Session Scale**: Customizable match configuration via the Main Menu lobby, allowing the user to select between 1 and 5 bot opponents.

---

## Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Clone the repository:
2. Install project dependencies:
   npm install
3. Boot up the local hot-reloading development server:
   npm run dev

---

## Future Roadmap
- Set up a bot decision matrix for playing more logical moves
- Incorporate Favor Tokens currency tracking to persist match victories across multiple rounds.
- Click-to-inspect description popup overlays.
- Add a local multiplayer hot-seat mode utilizing the modular PlayerConfig architecture.
