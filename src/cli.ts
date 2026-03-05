import readline from "node:readline";
import {
  parseCards,
  cardToString,
  type Card,
} from "./cards";
import { HandCategory } from "./hand5";
import { evaluateGame } from "./game";

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function parseCardLine(line: string): Card[] {
  const parts = line
    .split(/[\s,]+/)
    .map((p) => p.trim().replace(/,/g, ""))
    .filter(Boolean);
  if (parts.length === 0) {
    throw new Error("No cards provided.");
  }
  return parseCards(parts);
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("=== Texas Hold'em Hand Evaluator ===");
    console.log("Enter cards as codes like: AH KD 2C ...");
    console.log("Ranks: 2-9 T J Q K A | Suits: C D H S\n");

    const boardLine = await askQuestion(
      rl,
      "Board (5 community cards, space-separated): ",
    );
    const board = parseCardLine(boardLine);
    if (board.length !== 5) {
      throw new Error("Board must contain exactly 5 cards.");
    }

    const playersCountLine = await askQuestion(
      rl,
      "Number of players (each with 2 hole cards): ",
    );
    const playersCount = Number.parseInt(playersCountLine, 10);
    if (!Number.isFinite(playersCount) || playersCount <= 0) {
      throw new Error("Number of players must be a positive integer.");
    }

    const players: Card[][] = [];
    for (let i = 0; i < playersCount; i++) {
      const line = await askQuestion(
        rl,
        `Player ${i} hole cards (2 cards, space-separated): `,
      );
      const cards = parseCardLine(line);
      if (cards.length !== 2) {
        throw new Error("Each player must have exactly 2 hole cards.");
      }
      players.push(cards);
    }

    const result = evaluateGame(board, players);

    console.log("\n=== Results ===");
    for (const player of result.players) {
      const codes = player.evaluation.chosen5.map(cardToString).join(" ");
      const categoryName = HandCategory[player.evaluation.category];
      console.log(`Player ${player.index}: ${categoryName} (${codes})`);
    }

    console.log("\nWinner index(es):");
    for (const idx of result.winnerIndexes) {
      console.log(`Player ${idx}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred.";
    console.error("Error:", message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

void main();

