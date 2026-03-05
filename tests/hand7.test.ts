import { describe, it, expect } from "vitest";
import { parseCards, type Card } from "../src/cards";
import { evaluate7 } from "../src/hand7";
import { HandCategory } from "../src/hand5";

function evalFromCodes(boardCodes: string[], holeCodes: string[]) {
  const board = parseCards(boardCodes);
  const hole = parseCards(holeCodes);
  const all: Card[] = [...board, ...hole];
  return evaluate7(all);
}

function codesFromEval(boardCodes: string[], holeCodes: string[]): string[] {
  const evaluation = evalFromCodes(boardCodes, holeCodes);
  return evaluation.chosen5.map((c) => `${c.rank}${c.suit}`);
}

describe("evaluate7 - best 5 from 7 cards", () => {
  it("uses board plays when board already holds the best hand (straight)", () => {
    const board = ["5C", "6D", "7H", "8S", "9D"];
    const player = ["AC", "AD"];

    const resultCodes = codesFromEval(board, player);
    expect(resultCodes).toEqual(["9D", "8S", "7H", "6D", "5C"]);
  });

  it("picks the best flush among more than 5 suited cards (example-like)", () => {
    const board = ["AH", "JH", "9H", "4H", "2C"];
    const player = ["6H", "KD"];

    const resultCodes = codesFromEval(board, player);
    expect(resultCodes).toEqual(["AH", "JH", "9H", "6H", "4H"]);
  });

  it("handles Ace-low straight (wheel) across board and hole cards", () => {
    const board = ["AC", "2D", "3H", "4S", "9D"];
    const player = ["5C", "KD"];

    const resultCodes = codesFromEval(board, player);
    expect(resultCodes).toEqual(["5C", "4S", "3H", "2D", "AC"]);
  });

  it("chooses full house when available over a lower category", () => {
    const board = ["2H", "2D", "2C", "KS", "9D"];
    const player = ["KD", "3C"];

    const resultCodes = codesFromEval(board, player);
    expect(resultCodes).toEqual(["2H", "2D", "2C", "KS", "KD"]);
  });

  it("detects four of a kind formed using board and one hole card kicker", () => {
    const board = ["7C", "7D", "7H", "7S", "2D"];
    const player = ["AC", "KC"];

    const result = evalFromCodes(board, player);
    expect(result.category).toBe(HandCategory.FOUR_OF_A_KIND);
    const resultCodes = result.chosen5.map((c) => `${c.rank}${c.suit}`);
    expect(resultCodes).toContain("7C");
    expect(resultCodes).toContain("7D");
    expect(resultCodes).toContain("7H");
    expect(resultCodes).toContain("7S");
    expect(resultCodes).toContain("AC");
  });
});

