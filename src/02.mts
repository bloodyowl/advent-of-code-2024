import { Array, Option } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";
import { match, P } from "ts-pattern";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/02.txt"),
  "utf-8",
);

const lines = Array.filterMap(input.trim().split("\n"), line => {
  return match(line.split(/\s+/).map(x => parseInt(x, 10)))
    .returnType<Option<[number, ...number[]]>>()
    .with([P.number, ...P.array(P.number)], Option.Some)
    .otherwise(Option.None);
});

const getDeltas = (line: [number, ...number[]]) => {
  let prev = line[0];
  const deltas: number[] = [];
  line.slice(1).forEach(item => {
    deltas.push(item - prev);
    prev = item;
  });
  return deltas;
};

const isOk = (deltas: number[]) =>
  (deltas.every(item => item > 0) || deltas.every(item => item < 0)) &&
  Math.min(...deltas.map(Math.abs)) >= 1 &&
  Math.max(...deltas.map(Math.abs)) <= 3;

const part1 = () => {
  return lines.map(getDeltas).filter(isOk).length;
};

console.log("Part 1", part1());

const part2 = () => {
  return lines
    .map(line => ({ line, deltas: getDeltas(line) }))
    .filter(({ deltas, line }) => {
      if (isOk(deltas)) {
        return true;
      }
      let index = -1;
      while (++index < line.length) {
        const filteredLine = [
          ...line.slice(0, index),
          ...line.slice(index + 1),
        ] as [number, ...number[]];
        if (isOk(getDeltas(filteredLine))) {
          return true;
        }
      }
    }).length;
};

console.log("Part 2", part2());
