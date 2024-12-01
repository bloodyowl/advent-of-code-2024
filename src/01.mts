import { Array, Option } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";
import { match, P } from "ts-pattern";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/01.txt"),
  "utf-8",
);

const lines = input.trim().split("\n");
const [a, b] = Array.unzip(
  Array.filterMap(lines, line => {
    return match(line.split(/\s+/).map(x => parseInt(x, 10)))
      .returnType<Option<[number, number]>>()
      .with([P.number, P.number], ([a, b]) => Option.Some([a, b]))
      .otherwise(() => Option.None());
  }),
);

const sortedA = a.toSorted((a, b) => (b > a ? -1 : 1));
const sortedB = b.toSorted((a, b) => (b > a ? -1 : 1));

const part1 = () => {
  return Array.zip(sortedA, sortedB)
    .map(([a, b]) => Math.abs(a - b))
    .reduce((acc, distance) => acc + distance, 0);
};

console.log("Part 1", part1());

const part2 = () => {
  const occurencesInB = new Map();
  sortedB.forEach(item => {
    occurencesInB.set(item, (occurencesInB.get(item) ?? 0) + 1);
  });
  return sortedA.reduce((acc, item) => {
    return acc + item * (occurencesInB.get(item) ?? 0);
  }, 0);
};

console.log("Part 2", part2());
