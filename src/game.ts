import type { Card } from "./cards";
import { evaluate7 } from "./hand7";
import { compareHandEvaluations, type HandEvaluation } from "./hand5";

export interface PlayerEvaluation {
  index: number;
  evaluation: HandEvaluation;
}

export interface GameResult {
  players: PlayerEvaluation[];
  winnerIndexes: number[];
}

export function evaluateGame(board: Card[], playersHoleCards: Card[][]): GameResult {
  if (board.length !== 5) {
    throw new Error("evaluateGame expects exactly 5 board cards");
  }

  const players: PlayerEvaluation[] = playersHoleCards.map((holeCards, index) => {
    if (holeCards.length !== 2) {
      throw new Error("Each player must have exactly 2 hole cards");
    }
    const allCards: Card[] = [...board, ...holeCards];
    const evaluation = evaluate7(allCards);
    return { index, evaluation };
  });

  let best: PlayerEvaluation | null = null;
  let winnerIndexes: number[] = [];

  for (const player of players) {
    if (!best) {
      best = player;
      winnerIndexes = [player.index];
      continue;
    }

    const cmp = compareHandEvaluations(player.evaluation, best.evaluation);
    if (cmp > 0) {
      best = player;
      winnerIndexes = [player.index];
    } else if (cmp === 0) {
      winnerIndexes.push(player.index);
    }
  }

  return { players, winnerIndexes };
}

