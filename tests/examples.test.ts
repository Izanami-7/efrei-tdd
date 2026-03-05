import { describe, it, expect } from "vitest";
import { parseCards } from "../src/cards";
import { evaluateGame } from "../src/game";
import { HandCategory } from "../src/hand5";

function chosenCodesFromPlayer(boardCodes: string[], playerCodes: string[][], playerIndex: number): string[] {
  const board = parseCards(boardCodes);
  const players = playerCodes.map(parseCards);
  const result = evaluateGame(board, players);
  return result.players[playerIndex].evaluation.chosen5.map((c) => `${c.rank}${c.suit}`);
}

describe("exam examples A–E", () => {
  it("Example A — Ace-low straight (wheel)", () => {
    const board = ["AC", "2D", "3H", "4S", "9D"];
    const players = [["5C", "KD"]];

    const codes = chosenCodesFromPlayer(board, players, 0);
    expect(codes).toEqual(["5C", "4S", "3H", "2D", "AC"]);
  });

  it("Example B — Ace-high straight", () => {
    const board = ["TC", "JD", "QH", "KS", "2D"];
    const players = [["AC", "3D"]];

    const codes = chosenCodesFromPlayer(board, players, 0);
    expect(codes).toEqual(["AC", "KS", "QH", "JD", "TC"]);
  });

  it("Example C — Flush with more than 5 suited cards", () => {
    const board = ["AH", "JH", "9H", "4H", "2C"];
    const players = [["6H", "KD"]];

    const codes = chosenCodesFromPlayer(board, players, 0);
    expect(codes).toEqual(["AH", "JH", "9H", "6H", "4H"]);
  });

  it("Example D — Board plays (tie)", () => {
    const board = ["5C", "6D", "7H", "8S", "9D"];
    const players = [
      ["AC", "AD"],
      ["KC", "QD"],
    ];

    const boardPlays = chosenCodesFromPlayer(board, players, 0);
    expect(boardPlays).toEqual(["9D", "8S", "7H", "6D", "5C"]);

    const boardPlays2 = chosenCodesFromPlayer(board, players, 1);
    expect(boardPlays2).toEqual(["9D", "8S", "7H", "6D", "5C"]);

    const result = evaluateGame(parseCards(board), players.map(parseCards));
    expect(result.winnerIndexes).toEqual([0, 1]);
  });

  it("Example E — Quads on board, kicker decides", () => {
    const board = ["7C", "7D", "7H", "7S", "2D"];
    const players = [
      ["AC", "KC"],
      ["QC", "JC"],
    ];

    const boardCards = parseCards(board);
    const playerCards = players.map(parseCards);
    const result = evaluateGame(boardCards, playerCards);

    expect(result.players[0].evaluation.category).toBe(HandCategory.FOUR_OF_A_KIND);
    expect(result.players[1].evaluation.category).toBe(HandCategory.FOUR_OF_A_KIND);
    expect(result.winnerIndexes).toEqual([0]);
  });
});

