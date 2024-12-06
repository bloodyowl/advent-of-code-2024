import { Array, Option, Result } from "@swan-io/boxed";
import { readFileSync } from "node:fs";
import path from "node:path";
import { match } from "ts-pattern";

const input = readFileSync(
  path.join(import.meta.dirname, "./input/06.txt"),
  "utf-8",
);

type Direction = "Up" | "Down" | "Left" | "Right";

const OBSTACLE = "#";
const lines = input.split("\n");
const rowHeight = lines.length;
const lineWidth = Option.fromNullable(lines.at(0)).map(line => line.length);

type Position = { x: number; y: number; direction: Direction };

const visit = ({
  initialGuardPosition,
  lineWidth,
  additionalObstacle,
}: {
  initialGuardPosition: Position;
  lineWidth: number;
  additionalObstacle?: { x: number; y: number };
}): Result<
  { visited: Set<number>; visitedWithDirection: Set<Position> },
  Position
> => {
  const visited = new Set<number>();
  const visitedWithDirection = new Set<Position>();
  const visitedWithDirectionSerialized = new Set<string>();

  const currentPosition = { ...initialGuardPosition };

  const shiftRight = () => {
    const nextDirection = match(currentPosition.direction)
      .returnType<Direction>()
      .with("Up", () => "Right")
      .with("Right", () => "Down")
      .with("Down", () => "Left")
      .with("Left", () => "Up")
      .exhaustive();
    currentPosition.direction = nextDirection;
  };

  const get = (x: number, y: number) => {
    if (
      additionalObstacle != null &&
      additionalObstacle.x === currentPosition.x + x &&
      additionalObstacle.y === currentPosition.y + y
    ) {
      return Option.Some(OBSTACLE);
    }
    return Option.fromNullable(lines[currentPosition.y + y]).flatMap(line =>
      Option.fromNullable(line[currentPosition.x + x]),
    );
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

    match(currentPosition.direction)
      .with("Up", () =>
        match(get(0, -1))
          .with(Option.P.Some(OBSTACLE), () => shiftRight())
          .otherwise(() => (currentPosition.y -= 1)),
      )
      .with("Right", () =>
        match(get(1, 0))
          .with(Option.P.Some(OBSTACLE), () => shiftRight())
          .otherwise(() => (currentPosition.x += 1)),
      )
      .with("Down", () =>
        match(get(0, 1))
          .with(Option.P.Some(OBSTACLE), () => shiftRight())
          .otherwise(() => (currentPosition.y += 1)),
      )
      .with("Left", () =>
        match(get(-1, 0))
          .with(Option.P.Some(OBSTACLE), () => shiftRight())
          .otherwise(() => (currentPosition.x -= 1)),
      );
  }
  return Result.Ok({ visited, visitedWithDirection });
};

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
);

const part1 = () => {
  return Option.allFromDict({ initialGuardPosition, lineWidth })
    .toResult(new Error("No data"))
    .flatMap(visit)
    .map(({ visited }) => visited.size)
    .getOr(0);
};

console.log("Part 1", part1());

const getAbs = (x: number, y: number) => {
  return Option.fromNullable(lines[y]).flatMap(line =>
    Option.fromNullable(line[x]),
  );
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
  return Option.allFromDict({ initialGuardPosition, lineWidth })
    .toResult(new Error("No data"))
    .flatMap(({ initialGuardPosition, lineWidth }) =>
      visit({ initialGuardPosition, lineWidth }).map(values => ({
        ...values,
        initialGuardPosition,
        lineWidth,
      })),
    )
    .map(({ visitedWithDirection, initialGuardPosition, lineWidth }) => {
      const visited = [...visitedWithDirection];
      const potentialPositions = Array.filterMap(
        visited,
        ({ x, y, direction }) => {
          return match(direction)
            .with("Up", () =>
              match(getAbs(x, y - 1))
                .with(Option.P.Some(OBSTACLE), () => Option.None())
                .with(Option.P.None, () => Option.None())
                .otherwise(() => Option.Some({ x, y: y - 1 })),
            )
            .with("Right", () =>
              match(getAbs(x + 1, y))
                .with(Option.P.Some(OBSTACLE), () => Option.None())
                .with(Option.P.None, () => Option.None())
                .otherwise(() => Option.Some({ x: x + 1, y })),
            )
            .with("Down", () =>
              match(getAbs(x, y + 1))
                .with(Option.P.Some(OBSTACLE), () => Option.None())
                .with(Option.P.None, () => Option.None())
                .otherwise(() => Option.Some({ x, y: y + 1 })),
            )
            .with("Left", () =>
              match(getAbs(x - 1, y))
                .with(Option.P.Some(OBSTACLE), () => Option.None())
                .with(Option.P.None, () => Option.None())
                .otherwise(() => Option.Some({ x: x - 1, y })),
            )
            .exhaustive();
        },
      );
      return Array.filterMap(
        deduplicatePositions(potentialPositions),
        potentialPosition => {
          const outcome = visit({
            initialGuardPosition,
            lineWidth,
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
