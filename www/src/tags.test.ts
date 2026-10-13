import assert from "node:assert/strict";
import { test } from "node:test";
import { orderTags } from "./tags.ts";

const tag = (id: string, sortOrder = 1) => ({ id, data: { sortOrder } });

test("orders tags by group, then by sortOrder", () => {
  const ordered = orderTags([
    tag("tool/git"),
    tag("language/typescript", 2),
    tag("language/html", 1),
  ]);

  assert.deepEqual(
    ordered.flat().map((item) => item.id),
    ["language/html", "language/typescript", "tool/git"],
  );
});

test("drops legacy tags", () => {
  assert.deepEqual(orderTags([tag("legacy/angular")]).flat(), []);
});

test("fails for a folder missing from GROUPS", () => {
  assert.throws(() => orderTags([tag("ai/claude")]), /ai\/claude/);
});
