import type { Card } from "./cards";
import { evaluate5, type HandEvaluation, compareHandEvaluations } from "./hand5";

function combinations5(cards: Card[]): Card[][] {
  if (cards.length !== 7) {
    throw new Error("combinations5 expects exactly 7 cards");
  }
  const result: Card[][] = [];
  const n = cards.length;
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
          }
        }
      }
    }
  }
  return result;
}

export function evaluate7(cards: Card[]): HandEvaluation {
  if (cards.length !== 7) {
    throw new Error("evaluate7 expects exactly 7 cards");
  }

  const combos = combinations5(cards);
  let bestEval: HandEvaluation | null = null;

  for (const combo of combos) {
    const current = evaluate5(combo);
    if (!bestEval) {
      bestEval = current;
      continue;
    }
    const cmp = compareHandEvaluations(current, bestEval);
    if (cmp > 0) {
      bestEval = current;
    }
  }

  // bestEval ne peut pas être null car il y a toujours 21 combinaisons
  return bestEval as HandEvaluation;
}

