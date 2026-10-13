import assert from "node:assert/strict";
import { test } from "node:test";
import { orderTags } from "./tags.ts";

test("orders tags by group, keeping the order within a group", () => {
  const ordered = orderTags([
    { id: "tool/git" },
    { id: "language/typescript" },
    { id: "language/html" },
  ]);

  assert.deepEqual(
    ordered.flat().map((tag) => tag.id),
    ["language/typescript", "language/html", "tool/git"],
  );
});

test("fails for a folder missing from GROUPS", () => {
  assert.throws(() => orderTags([{ id: "ai/claude" }]), /ai\/claude/);
});
