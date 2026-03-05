import { describe, it, expect } from "vitest";
import {
  parseCard,
  parseCards,
  cardToString,
  rankToValue,
  sortCardsByRankDesc,
  type Card,
} from "../src/cards";

describe("cards model and helpers", () => {
  it("parses a valid card code into a Card object", () => {
    const card = parseCard("AS");
    expect(card).toEqual<Card>({ rank: "A", suit: "S" });
  });

  it("parses multiple card codes at once", () => {
    const cards = parseCards(["AS", "KD", "2H"]);
    expect(cards).toEqual<Card[]>([
      { rank: "A", suit: "S" },
      { rank: "K", suit: "D" },
      { rank: "2", suit: "H" },
    ]);
  });

  it("formats a Card back to its string code", () => {
    const card: Card = { rank: "Q", suit: "C" };
    expect(cardToString(card)).toBe("QC");
  });

  it("is symmetrical between parseCard and cardToString", () => {
    const codes = ["AS", "KD", "TH", "9C", "2S"];
    const roundTripped = parseCards(codes).map(cardToString);
    expect(roundTripped).toEqual(codes);
  });

  it("rejects invalid card codes", () => {
    const invalidCodes = ["", "A", "10S", "XS", "AZ", "AHH"];
    for (const code of invalidCodes) {
      expect(() => parseCard(code)).toThrowError();
    }
  });

  it("maps ranks to numeric values for comparison", () => {
    expect(rankToValue("2")).toBe(2);
    expect(rankToValue("9")).toBe(9);
    expect(rankToValue("T")).toBe(10);
    expect(rankToValue("J")).toBe(11);
    expect(rankToValue("Q")).toBe(12);
    expect(rankToValue("K")).toBe(13);
    expect(rankToValue("A")).toBe(14);
  });

  it("sorts cards by rank descending", () => {
    const cards: Card[] = parseCards(["2H", "AS", "TD", "9C"]);
    const sorted = sortCardsByRankDesc(cards);
    const codes = sorted.map(cardToString);
    expect(codes).toEqual(["AS", "TD", "9C", "2H"]);
  });
});

