import { Array, Option, Result } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/06.txt"),
  "utf-8",
);

type Direction = "Up" | "Down" | "Left" | "Right";

type Position = { x: number; y: number; direction: Direction };

const OBSTACLE = "#";

const lines = input.split("\n");
const rowHeight = lines.length;

const lineWidth = Option.fromNullable(lines.at(0))
  .map(line => line.length)
  .toUndefined();

const initialGuardPosition = Array.findMap(
  lines.map((item, index) => [item, index] as const),
  ([line, lineIndex]) => {
    const index = line.indexOf("^");
    if (index === -1) {
      return Option.None();
    }
    const position: Position = { x: index, y: lineIndex, direction: "Up" };
    return Option.Some(position);
  },
).toUndefined();

if (lineWidth === undefined || initialGuardPosition === undefined) {
  process.exit(1);
}

const RIGHT_SHIFT_MAP = {
  Up: "Right" as const,
  Right: "Down" as const,
  Down: "Left" as const,
  Left: "Up" as const,
};

const visit = ({
  additionalObstacle,
}: {
  additionalObstacle?: { x: number; y: number };
}): Result<
  { visited: Set<number>; visitedWithDirection: Set<Position> },
  Position
> => {
  const visited = new Set<number>();
  const visitedWithDirection = new Set<Position>();
  const visitedWithDirectionSerialized = new Set<string>();

  const currentPosition = { ...initialGuardPosition };

  const get = (x: number, y: number) => {
    if (
      additionalObstacle != null &&
      additionalObstacle.x === currentPosition.x + x &&
      additionalObstacle.y === currentPosition.y + y
    ) {
      return OBSTACLE;
    }
    return lines[currentPosition.y + y]?.[currentPosition.x + x];
  };

  while (
    currentPosition.x >= 0 &&
    currentPosition.x < lineWidth &&
    currentPosition.y >= 0 &&
    currentPosition.y < rowHeight
  ) {
    const position = currentPosition.y * lineWidth + currentPosition.x;
    const currentPositionSerialized = `{${currentPosition.x},${currentPosition.y},${currentPosition.direction}}`;
    visited.add(position);
    visitedWithDirection.add({ ...currentPosition });

    if (visitedWithDirectionSerialized.has(currentPositionSerialized)) {
      return Result.Error(currentPosition);
    }
    visitedWithDirectionSerialized.add(currentPositionSerialized);

    switch (currentPosition.direction) {
      case "Up":
        if (get(0, -1) === OBSTACLE) {
          currentPosition.direction =
            RIGHT_SHIFT_MAP[currentPosition.direction];
        } else {
          currentPosition.y -= 1;
        }
        break;
      case "Right":
        if (get(1, 0) === OBSTACLE) {
          currentPosition.direction =
            RIGHT_SHIFT_MAP[currentPosition.direction];
        } else {
          currentPosition.x += 1;
        }
        break;
      case "Down":
        if (get(0, 1) === OBSTACLE) {
          currentPosition.direction =
            RIGHT_SHIFT_MAP[currentPosition.direction];
        } else {
          currentPosition.y += 1;
        }
        break;
      case "Left":
        if (get(-1, 0) === OBSTACLE) {
          currentPosition.direction =
            RIGHT_SHIFT_MAP[currentPosition.direction];
        } else {
          currentPosition.x -= 1;
        }
        break;
    }
  }
  return Result.Ok({ visited, visitedWithDirection });
};

const part1 = () => {
  return visit({})
    .map(({ visited }) => visited.size)
    .getOr(0);
};

console.log("Part 1", part1());

const getAbs = (x: number, y: number) => {
  return lines[y]?.[x];
};

const deduplicatePositions = (array: Array<{ x: number; y: number }>) => {
  const set = new Set<string>();
  const deduplicated: Array<{ x: number; y: number }> = [];
  array.forEach(({ x, y }) => {
    const serialized = `{${x},${y}}`;
    if (set.has(serialized)) {
      return;
    }
    set.add(serialized);
    deduplicated.push({ x, y });
  });
  return deduplicated;
};

const part2 = () => {
  return visit({})
    .map(({ visitedWithDirection }) => {
      const visited = [...visitedWithDirection];
      const potentialPositions = Array.filterMap(
        visited,
        ({ x, y, direction }) => {
          switch (direction) {
            case "Up": {
              const next = getAbs(x, y - 1);
              if (next === undefined || next === OBSTACLE) {
                return Option.None();
              } else {
                return Option.Some({ x, y: y - 1 });
              }
            }
            case "Right": {
              const next = getAbs(x + 1, y);
              if (next === undefined || next === OBSTACLE) {
                return Option.None();
              } else {
                return Option.Some({ x: x + 1, y });
              }
            }
            case "Down": {
              const next = getAbs(x, y + 1);
              if (next === undefined || next === OBSTACLE) {
                return Option.None();
              } else {
                return Option.Some({ x, y: y + 1 });
              }
            }
            case "Left": {
              const next = getAbs(x - 1, y);
              if (next === undefined || next === OBSTACLE) {
                return Option.None();
              } else {
                return Option.Some({ x: x - 1, y });
              }
            }
          }
        },
      );
      return Array.filterMap(
        deduplicatePositions(potentialPositions),
        potentialPosition => {
          const outcome = visit({
            additionalObstacle: potentialPosition,
          });
          if (outcome.isError()) {
            return Option.Some(outcome.getError());
          } else {
            return Option.None();
          }
        },
      ).length;
    })
    .getOr(0);
};

console.log("Part 2", part2());
