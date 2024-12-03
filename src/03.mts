import { readFileSync } from "node:fs";
import path from "node:path";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/03.txt"),
  "utf-8",
);

const MUL_REGEXP = /mul\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;

const part1 = () => {
  return input.matchAll(MUL_REGEXP).reduce((acc, [_, a, b]) => {
    if (a == null || b == null) {
      return acc;
    }
    return acc + parseInt(a, 10) * parseInt(b, 10);
  }, 0);
};

console.log("Part 1", part1());

const part2 = () => {
  return input.matchAll(MUL_REGEXP).reduce((acc, match) => {
    const [_, a, b] = match;
    if (a == null || b == null) {
      return acc;
    }
    const closestDo = input.lastIndexOf("do()", match.index);
    const closestDont = input.lastIndexOf("don't()", match.index);
    if (closestDont > closestDo) {
      return acc;
    }
    return acc + parseInt(a, 10) * parseInt(b, 10);
  }, 0);
};

console.log("Part 2", part2());
