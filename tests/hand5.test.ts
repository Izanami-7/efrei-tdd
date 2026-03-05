import { describe, it, expect } from "vitest";
import { parseCards, type Card } from "../src/cards";
import {
  evaluate5,
  compareHandEvaluations,
  HandCategory,
  type HandEvaluation,
} from "../src/hand5";

function codes(evaluation: HandEvaluation): string[] {
  return evaluation.chosen5.map((card) => `${card.rank}${card.suit}`);
}

describe("evaluate5 - 5-card hand evaluation", () => {
  it("detects high card with cards sorted descending", () => {
    const cards = parseCards(["2H", "9C", "KD", "5S", "7D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.HIGH_CARD);
    expect(codes(result)).toEqual(["KD", "9C", "7D", "5S", "2H"]);
  });

  it("detects one pair and orders pair then kickers", () => {
    const cards = parseCards(["2H", "2C", "KD", "5S", "7D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.ONE_PAIR);
    expect(codes(result)).toEqual(["2H", "2C", "KD", "7D", "5S"]);
  });

  it("detects two pair and orders higher pair, lower pair, then kicker", () => {
    const cards = parseCards(["2H", "2C", "KD", "KS", "7D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.TWO_PAIR);
    expect(codes(result)).toEqual(["KD", "KS", "2H", "2C", "7D"]);
  });

  it("detects three of a kind with kickers", () => {
    const cards = parseCards(["2H", "2C", "2D", "KS", "7D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.THREE_OF_A_KIND);
    expect(codes(result)).toEqual(["2H", "2C", "2D", "KS", "7D"]);
  });

  it("detects a straight with highest card first", () => {
    const cards = parseCards(["5H", "6C", "7D", "8S", "9D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.STRAIGHT);
    expect(codes(result)).toEqual(["9D", "8S", "7D", "6C", "5H"]);
  });

  it("detects an Ace-low straight (wheel) as 5-high", () => {
    const cards = parseCards(["AH", "2C", "3D", "4S", "5D"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.STRAIGHT);
    expect(codes(result)).toEqual(["5D", "4S", "3D", "2C", "AH"]);
  });

  it("detects a flush and sorts cards by rank descending", () => {
    const cards = parseCards(["2H", "9H", "KH", "5H", "7H"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.FLUSH);
    expect(codes(result)).toEqual(["KH", "9H", "7H", "5H", "2H"]);
  });

  it("detects a full house (trips then pair)", () => {
    const cards = parseCards(["2H", "2C", "2D", "KS", "KD"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.FULL_HOUSE);
    expect(codes(result)).toEqual(["2H", "2C", "2D", "KS", "KD"]);
  });

  it("detects four of a kind with kicker last", () => {
    const cards = parseCards(["2H", "2C", "2D", "2S", "KD"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.FOUR_OF_A_KIND);
    expect(codes(result)).toEqual(["2H", "2C", "2D", "2S", "KD"]);
  });

  it("detects a straight flush including the wheel", () => {
    const cards = parseCards(["5H", "4H", "3H", "2H", "AH"]);
    const result = evaluate5(cards);

    expect(result.category).toBe(HandCategory.STRAIGHT_FLUSH);
    expect(codes(result)).toEqual(["5H", "4H", "3H", "2H", "AH"]);
  });
});

describe("compareHandEvaluations - tie-breaks for equal categories", () => {
  function evalFromCodes(codes: string[]): HandEvaluation {
    const cards: Card[] = parseCards(codes);
    return evaluate5(cards);
  }

  it("compares two one-pair hands by pair rank then kickers", () => {
    const lowPair = evalFromCodes(["2H", "2C", "KD", "7S", "5D"]);
    const highPair = evalFromCodes(["3H", "3C", "KD", "7S", "5D"]);

    expect(compareHandEvaluations(highPair, lowPair)).toBeGreaterThan(0);
    expect(compareHandEvaluations(lowPair, highPair)).toBeLessThan(0);
  });

  it("compares two flushes by highest card, then next, etc.", () => {
    const flushA = evalFromCodes(["AH", "QH", "9H", "4H", "2H"]);
    const flushB = evalFromCodes(["KH", "QH", "9H", "4H", "2H"]);

    expect(compareHandEvaluations(flushA, flushB)).toBeGreaterThan(0);
    expect(compareHandEvaluations(flushB, flushA)).toBeLessThan(0);
  });

  it("declares a tie when all ranks are equal", () => {
    const handA = evalFromCodes(["AH", "KH", "QH", "JH", "TH"]);
    const handB = evalFromCodes(["AD", "KD", "QD", "JD", "TD"]);

    const comparison = compareHandEvaluations(handA, handB);
    expect(comparison).toBe(0);
  });

  it("breaks two-pair ties using kicker when pairs are equal", () => {
    const withAceKicker = evalFromCodes(["AH", "AD", "KC", "KD", "2S"]);
    const withQueenKicker = evalFromCodes(["AH", "AD", "KC", "KD", "QH"]);

    expect(compareHandEvaluations(withQueenKicker, withAceKicker)).toBeGreaterThan(0);
    expect(compareHandEvaluations(withAceKicker, withQueenKicker)).toBeLessThan(0);
  });

  it("compares full houses by trips rank first, then pair rank", () => {
    const fullHouseHighTrips = evalFromCodes(["KH", "KD", "KC", "2S", "2D"]); // K full of 2s
    const fullHouseLowTrips = evalFromCodes(["QH", "QD", "QC", "AS", "AD"]); // Q full of As

    expect(compareHandEvaluations(fullHouseHighTrips, fullHouseLowTrips)).toBeGreaterThan(0);
    expect(compareHandEvaluations(fullHouseLowTrips, fullHouseHighTrips)).toBeLessThan(0);
  });
});

