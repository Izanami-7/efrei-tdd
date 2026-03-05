import { describe, it, expect } from "vitest";
import { parseCards } from "../src/cards";
import { HandCategory } from "../src/hand5";
import { evaluateGame } from "../src/game";

describe("evaluateGame - multi player comparison", () => {
  it("finds a single winner when one player has the best hand", () => {
    const board = parseCards(["2H", "7D", "9C", "TS", "KD"]);
    const players = [
      parseCards(["2C", "3C"]), // one pair of 2s
      parseCards(["KH", "KS"]), // three of a kind (kings)
    ];

    const result = evaluateGame(board, players);

    expect(result.winnerIndexes).toEqual([1]);
    expect(result.players[1].evaluation.category).toBe(HandCategory.THREE_OF_A_KIND);
  });

  it("returns both players as winners when board plays (perfect tie)", () => {
    const board = parseCards(["5C", "6D", "7H", "8S", "9D"]);
    const players = [
      parseCards(["AC", "AD"]),
      parseCards(["KC", "QD"]),
    ];

    const result = evaluateGame(board, players);

    expect(result.winnerIndexes).toEqual([0, 1]);
    const codes = result.players[0].evaluation.chosen5.map((c) => `${c.rank}${c.suit}`);
    expect(codes).toEqual(["9D", "8S", "7H", "6D", "5C"]);
  });

  it("uses kicker to break ties when quads are on the board", () => {
    const board = parseCards(["7C", "7D", "7H", "7S", "2D"]);
    const players = [
      parseCards(["AC", "KC"]), // A kicker
      parseCards(["QC", "JC"]), // Q kicker
    ];

    const result = evaluateGame(board, players);

    expect(result.winnerIndexes).toEqual([0]);
    const codes = result.players[0].evaluation.chosen5.map((c) => `${c.rank}${c.suit}`);
    expect(codes).toContain("AC");
  });
});

