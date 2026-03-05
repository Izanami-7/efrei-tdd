export type RankSymbol = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";

export type SuitSymbol = "C" | "D" | "H" | "S";

export interface Card {
  rank: RankSymbol;
  suit: SuitSymbol;
}

const RANK_ORDER: RankSymbol[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

const SUITS: SuitSymbol[] = ["C", "D", "H", "S"];

export function parseCard(code: string): Card {
  if (code.length !== 2) {
    throw new Error(`Invalid card code length: "${code}"`);
  }

  const rankChar = code[0] as RankSymbol;
  const suitChar = code[1] as SuitSymbol;

  if (!RANK_ORDER.includes(rankChar)) {
    throw new Error(`Invalid rank in card code: "${code}"`);
  }

  if (!SUITS.includes(suitChar)) {
    throw new Error(`Invalid suit in card code: "${code}"`);
  }

  return { rank: rankChar, suit: suitChar };
}

export function parseCards(codes: string[]): Card[] {
  return codes.map(parseCard);
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function rankToValue(rank: RankSymbol): number {
  // 2 → 2, ... 9 → 9, T → 10, J → 11, Q → 12, K → 13, A → 14
  const index = RANK_ORDER.indexOf(rank);
  // index is always >= 0 because rank is RankSymbol
  return 2 + index;
}

export function sortCardsByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
}

