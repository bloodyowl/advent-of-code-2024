import { Array, Option } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/04.txt"),
  "utf-8",
);

const lines = input.split("\n");

const get = (lineIndex: number, charIndex: number) =>
  Option.fromNullable(lines[lineIndex]?.[charIndex]);

const part1 = () => {
  return lines.reduce((acc, line, lineIndex) => {
    return Array.from(line).reduce((acc, char, charIndex) => {
      if (char !== "X") {
        return acc;
      }
      return (
        acc +
        Array.filterMap(
          [
            // horizontal forward
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex, charIndex + 1),
              get(lineIndex, charIndex + 2),
              get(lineIndex, charIndex + 3),
            ]),
            // horizontal backward
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex, charIndex - 1),
              get(lineIndex, charIndex - 2),
              get(lineIndex, charIndex - 3),
            ]),
            // vertical forward
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex + 1, charIndex),
              get(lineIndex + 2, charIndex),
              get(lineIndex + 3, charIndex),
            ]),
            // vertical backward
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex - 1, charIndex),
              get(lineIndex - 2, charIndex),
              get(lineIndex - 3, charIndex),
            ]),
            // diagonal top left to bottom right
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex + 1, charIndex + 1),
              get(lineIndex + 2, charIndex + 2),
              get(lineIndex + 3, charIndex + 3),
            ]),
            // diagonal top right to bottom left
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex + 1, charIndex - 1),
              get(lineIndex + 2, charIndex - 2),
              get(lineIndex + 3, charIndex - 3),
            ]),
            // diagonal bottom left to top right
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex - 1, charIndex + 1),
              get(lineIndex - 2, charIndex + 2),
              get(lineIndex - 3, charIndex + 3),
            ]),
            // diagonal bottom right to top left
            Option.all([
              get(lineIndex, charIndex),
              get(lineIndex - 1, charIndex - 1),
              get(lineIndex - 2, charIndex - 2),
              get(lineIndex - 3, charIndex - 3),
            ]),
          ],
          x => x,
        )
          .map(item => item.join(""))
          .filter(item => item === "XMAS").length
      );
    }, acc);
  }, 0);
};

console.log("Part 1", part1());

const part2 = () => {
  return lines.reduce((acc, line, lineIndex) => {
    return Array.from(line).reduce((acc, char, charIndex) => {
      if (char !== "A") {
        return acc;
      }
      return (
        acc +
        (Array.filterMap(
          [
            // diagonal top left to bottom right
            Option.all([
              get(lineIndex - 1, charIndex - 1),
              get(lineIndex, charIndex),
              get(lineIndex + 1, charIndex + 1),
            ]),
            // diagonal top right to bottom left
            Option.all([
              get(lineIndex - 1, charIndex + 1),
              get(lineIndex, charIndex),
              get(lineIndex + 1, charIndex - 1),
            ]),
          ],
          x => x,
        )
          .map(item => item.join(""))
          .filter(item => {
            return item === "MAS" || item === "SAM";
          }).length === 2
          ? 1
          : 0)
      );
    }, acc);
  }, 0);
};

console.log("Part 2", part2());
