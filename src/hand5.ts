import type { Card, RankSymbol } from "./cards";
import { rankToValue } from "./cards";

export enum HandCategory {
  HIGH_CARD = 1,
  ONE_PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
}

export interface HandEvaluation {
  category: HandCategory;
  rankValues: number[];
  chosen5: Card[];
}

interface RankInfo {
  rank: RankSymbol;
  count: number;
  value: number;
}

function buildRankInfos(cards: Card[]): RankInfo[] {
  const counts = new Map<RankSymbol, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }

  const infos: RankInfo[] = [];
  for (const [rank, count] of counts.entries()) {
    infos.push({ rank, count, value: rankToValue(rank) });
  }
  // sort by count desc then value desc
  infos.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.value - a.value;
  });
  return infos;
}

function isFlush(cards: Card[]): boolean {
  const firstSuit = cards[0].suit;
  return cards.every((c) => c.suit === firstSuit);
}

function detectStraight(cards: Card[]): { isStraight: boolean; highValue: number; ordered: Card[] } {
  const sorted = [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
  const values = [...new Set(sorted.map((c) => rankToValue(c.rank)))];

  // wheel: A-2-3-4-5 (A is low, 5-high straight)
  const isWheel =
    values.length === 5 &&
    values[0] === 14 &&
    values.includes(5) &&
    values.includes(4) &&
    values.includes(3) &&
    values.includes(2);
  if (isWheel) {
    const ordered = [...sorted].sort((a, b) => {
      const va = a.rank === "A" ? 1 : rankToValue(a.rank);
      const vb = b.rank === "A" ? 1 : rankToValue(b.rank);
      return vb - va;
    });
    return { isStraight: true, highValue: 5, ordered };
  }

  if (values.length !== 5) {
    return { isStraight: false, highValue: 0, ordered: sorted };
  }

  const expected = values[0] - 4;
  if (values[4] === expected) {
    return { isStraight: true, highValue: values[0], ordered: sorted };
  }

  return { isStraight: false, highValue: 0, ordered: sorted };
}

export function evaluate5(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error("evaluate5 expects exactly 5 cards");
  }

  const ranks = buildRankInfos(cards);
  const flush = isFlush(cards);
  const straightInfo = detectStraight(cards);

  if (flush && straightInfo.isStraight) {
    return {
      category: HandCategory.STRAIGHT_FLUSH,
      rankValues: [straightInfo.highValue],
      chosen5: straightInfo.ordered,
    };
  }

  const [first, second, third] = ranks;

  if (first.count === 4) {
    const quadRank = first.value;
    const kickerRank = second.value;
    const quadCards: Card[] = [];
    const kickerCards: Card[] = [];
    for (const card of cards) {
      if (rankToValue(card.rank) === quadRank) {
        quadCards.push(card);
      } else {
        kickerCards.push(card);
      }
    }
    return {
      category: HandCategory.FOUR_OF_A_KIND,
      rankValues: [quadRank, kickerRank],
      chosen5: [...quadCards, ...kickerCards],
    };
  }

  if (first.count === 3 && second && second.count === 2) {
    const tripRank = first.value;
    const pairRank = second.value;
    const tripCards: Card[] = [];
    const pairCards: Card[] = [];
    for (const card of cards) {
      if (rankToValue(card.rank) === tripRank) {
        tripCards.push(card);
      } else {
        pairCards.push(card);
      }
    }
    return {
      category: HandCategory.FULL_HOUSE,
      rankValues: [tripRank, pairRank],
      chosen5: [...tripCards, ...pairCards],
    };
  }

  if (flush) {
    const sorted = [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
    return {
      category: HandCategory.FLUSH,
      rankValues: sorted.map((c) => rankToValue(c.rank)),
      chosen5: sorted,
    };
  }

  if (straightInfo.isStraight) {
    return {
      category: HandCategory.STRAIGHT,
      rankValues: [straightInfo.highValue],
      chosen5: straightInfo.ordered,
    };
  }

  if (first.count === 3) {
    const tripRank = first.value;
    const tripCards: Card[] = [];
    const kickers: Card[] = [];
    for (const card of cards) {
      if (rankToValue(card.rank) === tripRank) {
        tripCards.push(card);
      } else {
        kickers.push(card);
      }
    }
    kickers.sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
    return {
      category: HandCategory.THREE_OF_A_KIND,
      rankValues: [tripRank, ...kickers.map((c) => rankToValue(c.rank))],
      chosen5: [...tripCards, ...kickers],
    };
  }

  if (first.count === 2 && second && second.count === 2) {
    const highPairRank = Math.max(first.value, second.value);
    const lowPairRank = Math.min(first.value, second.value);
    const highPair: Card[] = [];
    const lowPair: Card[] = [];
    const kickers: Card[] = [];

    for (const card of cards) {
      const v = rankToValue(card.rank);
      if (v === highPairRank) {
        highPair.push(card);
      } else if (v === lowPairRank) {
        lowPair.push(card);
      } else {
        kickers.push(card);
      }
    }

    const kicker = kickers[0];
    return {
      category: HandCategory.TWO_PAIR,
      rankValues: [highPairRank, lowPairRank, rankToValue(kicker.rank)],
      chosen5: [...highPair, ...lowPair, kicker],
    };
  }

  if (first.count === 2) {
    const pairRank = first.value;
    const pairCards: Card[] = [];
    const kickers: Card[] = [];
    for (const card of cards) {
      if (rankToValue(card.rank) === pairRank) {
        pairCards.push(card);
      } else {
        kickers.push(card);
      }
    }
    kickers.sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
    return {
      category: HandCategory.ONE_PAIR,
      rankValues: [pairRank, ...kickers.map((c) => rankToValue(c.rank))],
      chosen5: [...pairCards, ...kickers],
    };
  }

  const sorted = [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
  return {
    category: HandCategory.HIGH_CARD,
    rankValues: sorted.map((c) => rankToValue(c.rank)),
    chosen5: sorted,
  };
}

export function compareHandEvaluations(a: HandEvaluation, b: HandEvaluation): number {
  if (a.category !== b.category) {
    return a.category - b.category;
  }
  const len = Math.max(a.rankValues.length, b.rankValues.length);
  for (let i = 0; i < len; i++) {
    const av = a.rankValues[i] ?? 0;
    const bv = b.rankValues[i] ?? 0;
    if (av !== bv) {
      return av - bv;
    }
  }
  return 0;
}

