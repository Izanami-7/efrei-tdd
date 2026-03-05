# Texas Hold'em Hand Evaluator (TDD)

This project is a Texas Hold'em hand evaluator and comparer implemented in TypeScript using TDD.

Given:
- 5 community cards (the **board**)
- and for each player 2 **hole cards**

the library:
- computes each player's best 5‑card poker hand out of their 7 cards,
- compares all players,
- returns the winner(s), including ties/split pots,
- exposes the chosen best 5 cards and the hand category.

The rules follow the standard poker hand ordering described on the Wikipedia page “List of poker hands”.

## Stack

- Language: TypeScript (Node.js)
- Test framework: Vitest

## Installation

```bash
npm install
```

## Run tests

```bash
npm test
```

All development has been driven by tests: small incremental steps, green tests before refactors.

## Core concepts

### Card representation

Cards are represented as strings using **rank + suit**, for example:
- `\"AS\"` → Ace of spades,
- `\"TD\"` → Ten of diamonds,
- `\"5H\"` → Five of hearts.

Ranks: `2 3 4 5 6 7 8 9 T J Q K A`  
Suits: `C D H S`

Helpers in `cards`:
- `parseCard(code: string): Card`
- `parseCards(codes: string[]): Card[]`
- `cardToString(card: Card): string`

### Hand evaluation (5 cards)

`evaluate5(cards: Card[]): HandEvaluation`

- Input: exactly 5 distinct cards.
- Output:
  - `category: HandCategory`
  - `rankValues: number[]` (used internally for tie‑breaks)
  - `chosen5: Card[]` (the 5 cards, ordered deterministically)

Hand categories, from strongest to weakest:
1. `STRAIGHT_FLUSH`
2. `FOUR_OF_A_KIND`
3. `FULL_HOUSE`
4. `FLUSH`
5. `STRAIGHT`
6. `THREE_OF_A_KIND`
7. `TWO_PAIR`
8. `ONE_PAIR`
9. `HIGH_CARD`

Ordering of `chosen5`:
- **Straight / Straight flush**: highest‑to‑lowest in straight order.  
  - Ace‑low straight (wheel) `A‑2‑3‑4‑5` is represented as `5,4,3,2,A` (5‑high straight).
- **Four of a kind**: four cards of the rank first, then the kicker.
- **Full house**: three‑of‑a‑kind part first, then the pair.
- **Three of a kind**: triplet first, then remaining kickers in descending order.
- **Two pair**: higher pair, then lower pair, then kicker.
- **One pair**: pair first, then the three kickers in descending order.
- **Flush / High card**: all five cards sorted in descending rank.

Tie‑break rules are implemented according to the exam statement (and Wikipedia), by comparing:
- category,
- then `rankValues` lexicographically (quads + kicker, trips + kickers, pairs + kickers, flush/high‑card ranks, etc.).

### From 7 cards to best 5

`evaluate7(cards: Card[]): HandEvaluation`

- Input: exactly 7 distinct cards.
- Logic:
  - generate all 21 combinations of 5 cards out of the 7,
  - evaluate each with `evaluate5`,
  - keep the best one using the same comparison logic.

The output `chosen5` always contains exactly 5 distinct cards, drawn from the 7 input cards.

### Multi‑player evaluation

`evaluateGame(board: Card[], playersHoleCards: Card[][]): GameResult`

- `board`: exactly 5 community cards.
- `playersHoleCards`: one entry per player, each containing exactly 2 hole cards.

Returns:
- `players: PlayerEvaluation[]` where each entry contains:
  - `index: number` (0‑based),
  - `evaluation: HandEvaluation` (category + chosen5 + tie‑break info),
- `winnerIndexes: number[]`:
  - array of indexes of the winning players,
  - contains multiple indexes in case of an exact tie (split pot),
  - uses no suit‑based tie‑breaks (suits only matter for detecting flushes).

This function is responsible for:
- computing each player's best 5‑card hand from the 7 cards (2 hole + 5 board),
- comparing all players with the same tie‑break rules as `evaluate5`,
- detecting board‑plays cases where every player shares the same best 5 cards.

## Public API

Everything is re‑exported from `src/index.ts`:

- Card helpers:
  - `parseCard`, `parseCards`, `cardToString`, `sortCardsByRankDesc`
- Hand evaluation (5 & 7 cards):
  - `HandCategory`, `HandEvaluation`, `evaluate5`, `compareHandEvaluations`, `evaluate7`
- Game evaluation:
  - `evaluateGame`, `GameResult`, `PlayerEvaluation`

## Usage example

```ts
import {
  parseCards,
  evaluateGame
} from "./src/index";

const board = parseCards(["AH", "JH", "9H", "4H", "2C"]);
const players = [
  parseCards(["6H", "KD"]),
  parseCards(["AS", "AD"]),
];

const result = evaluateGame(board, players);

for (const player of result.players) {
  const codes = player.evaluation.chosen5.map((c) => `${c.rank}${c.suit}`);
  console.log(
    `Player ${player.index}:`,
    HandCategory[player.evaluation.category],
    codes.join(" ")
  );
}

console.log("Winner indexes:", result.winnerIndexes);
```

## Interactive CLI

This project also exposes a small interactive CLI to evaluate a game from the terminal.

### Run the CLI

```bash
npm start
```

You will then be prompted for:

- the **board** (5 community cards), as codes separated by spaces,
- the **number of players**,
- the **2 hole cards** for each player.

Example session:

```text
=== Texas Hold'em Hand Evaluator ===
Enter cards as codes like: AH KD 2C ...
Ranks: 2-9 T J Q K A | Suits: C D H S

Board (5 community cards, space-separated): AH JH 9H 4H 2C
Number of players (each with 2 hole cards): 2
Player 0 hole cards (2 cards, space-separated): 6H KD
Player 1 hole cards (2 cards, space-separated): AS AD

=== Results ===
Player 0: FLUSH (AH JH 9H 6H 4H)
Player 1: ONE_PAIR (AS AD AH JH 9H)

Winner index(es): 0
```

## Input validity

To keep the focus on hand evaluation and comparison:
- the code **assumes** that there are no duplicate cards in the inputs,
- behaviour with duplicate physical cards is unspecified.

If needed, an extra validation layer could be added on top to detect and reject such invalid inputs.

## Limitations and extensions

- No betting, blinds, chip stacks or side pots are modeled here.
- No support for jokers or wildcards.
- No suit ordering for tie-breaks (only flush detection).
- Possible extensions:
  - add an input validation layer for duplicate cards,
  - expose helpers to pretty-print hands and categories,
  - connect this evaluator to a higher-level game engine or UI.

