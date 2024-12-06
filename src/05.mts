import { Array, Option } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";
import { match, P } from "ts-pattern";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/05.txt"),
  "utf-8",
);

const [orderingRulesRaw, updatesRaw] = input.split("\n\n");

const orderingRules = new Map<number, Set<number>>();

match(
  orderingRulesRaw
    ?.split("\n")
    .map(item => item.split("|").map(x => parseInt(x))),
)
  .with(P.array([P.number, P.number]), x => x)
  .otherwise(() => [])
  .forEach(([key, value]) => {
    const set = orderingRules.get(key) ?? new Set();
    set.add(value);
    orderingRules.set(key, set);
  });

const updates = Option.fromNullable(updatesRaw?.split("\n"))
  .getOr([])
  .map(line => line.split(",").map(x => parseInt(x)));

const part1 = () => {
  return updates
    .filter(pages =>
      Array.zip(
        pages,
        pages.toSorted((a, b) => (orderingRules.get(a)?.has(b) ? -1 : 1)),
      ).every(([a, b]) => a === b),
    )
    .map(pages => pages.at(Math.floor(pages.length / 2)) ?? 0)
    .reduce((acc, item) => acc + item, 0);
};

console.log("Part 1", part1());

const part2 = () => {
  return Array.filterMap(updates, pages => {
    const sorted = pages.toSorted((a, b) =>
      orderingRules.get(a)?.has(b) ? -1 : 1,
    );
    return Option.fromPredicate(
      sorted,
      sorted => !Array.zip(pages, sorted).every(([a, b]) => a === b),
    );
  })
    .map(pages => pages.at(Math.floor(pages.length / 2)) ?? 0)
    .reduce((acc, item) => acc + item, 0);
};

console.log("Part 2", part2());
