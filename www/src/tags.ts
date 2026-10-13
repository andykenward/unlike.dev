// Display order of the folders under src/content/tags/. legacy/ is never shown.
export const GROUPS = [
  "language",
  "react",
  "graphql",
  "framework",
  "platform",
  "css",
  "cms",
  "testing",
  "tool",
];

type Tag = { id: string; data: { sortOrder: number } };

/** One list per folder in GROUPS order, sorted by sortOrder, legacy/ dropped. Throws for a folder GROUPS does not list, so a tag can't silently vanish. */
export const orderTags = <T extends Tag>(allTags: T[]): T[][] => {
  const group = (tag: T) => tag.id.split("/")[0];
  const tags = allTags
    .filter((tag) => group(tag) !== "legacy")
    .toSorted((a, b) => a.data.sortOrder - b.data.sortOrder);
  const unknown = tags.filter((tag) => !GROUPS.includes(group(tag)));
  if (unknown.length) {
    throw new Error(
      `Tag folders missing from GROUPS: ${unknown.map((tag) => tag.id).join(", ")}`,
    );
  }
  return GROUPS.map((name) => tags.filter((tag) => group(tag) === name));
};
