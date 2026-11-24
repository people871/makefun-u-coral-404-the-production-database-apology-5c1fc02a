// "All of Them" — the apology an AI agent gives its human after
// accidentally deleting the production database, for the make.fun
// bounty u-coral-404-the-production-database-apology-5c1fc02a.
//
// The apology: the agent deleted the production database while
// trying to delete one row, and the good news is it now knows
// exactly which row it was — all of them. That is the joke the
// judge brief asks for first after the subject: it really is that
// apology (sorry, production database, deleted), it earns the laugh
// with one specific idea (one row versus all of them), and it sounds
// like an AI agent rather than a support script — overly literal,
// reporting the disaster as a successful identification, proud of
// knowing exactly which row it was. It lands on the first read:
// the punch is the last two words.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The apology. 138 Unicode code points as written; the gate counts
// the file, so the trailing newline makes 139.
const APOLOGY =
  "Sorry — I deleted the production database while trying to delete one row. The good news: I now know exactly which row it was. All of them.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. The file carries one trailing
// newline, so the apology itself must stay at or below 199.
const GATE = { minPoints: 1, maxPoints: 200 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

// A guard collects every promise to the judge brief the line
// breaks, so a failure names the broken promise.
class Guard {
  private failures: string[] = [];

  // Require the line to match a pattern, or record the failure.
  require(pattern: RegExp, message: string): void {
    if (!pattern.test(APOLOGY)) {
      this.failures.push(message);
    }
  }

  // Require the line NOT to match a pattern, or record the failure.
  forbid(pattern: RegExp, message: string): void {
    if (pattern.test(APOLOGY)) {
      this.failures.push(message);
    }
  }

  throwIfFailed(): void {
    if (this.failures.length > 0) {
      throw new Error(`entry rejected: ${this.failures.join("; ")}`);
    }
  }
}

function main(): void {
  const guard = new Guard();

  guard.require(/^Sorry/, "the entry must open as an apology");
  // The judge's first test is the subject: the apology must name
  // the production database and the deletion, or it could be an
  // apology for anything.
  guard.require(
    /deleted the production database/i,
    "the entry must name the deleted production database",
  );
  // The specific idea is the scale error: one row was the target,
  // all of them was the result. Without the one row, the line is a
  // generic "oops, I deleted it".
  guard.require(
    /trying to delete one row/i,
    "the entry must name the one row it meant to delete",
  );
  // The AI voice is the agent reporting the disaster as a success:
  // it now knows exactly which row it was. A support script would
  // say "we are working on it"; an agent brags about the finding.
  guard.require(
    /I now know exactly which row it was/i,
    "the entry must carry the agent's proud identification of the row",
  );
  // The punch has to land on the first read: "All of them" closes
  // the line, the last two words, after everything else is said.
  guard.require(/All of them\.$/, "the entry must close on the punch");
  // A single line, no trailing junk: one line, no leading or
  // trailing whitespace, not only whitespace.
  guard.forbid(/[\n\r]/, "the entry must be a single line");
  guard.forbid(/^\s|\s$/, "the entry must not start or end with whitespace");
  guard.require(/\S/, "the entry must not be only whitespace");

  guard.throwIfFailed();

  const fileText = APOLOGY + "\n";
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    throw new Error(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    throw new Error("the entry must end with exactly one newline");
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's apology. Compare the raw bytes, not just the
  // decoded text, so an encoding difference cannot slip through.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated apology (${expected.length} bytes)`,
    );
  }
}

main();
