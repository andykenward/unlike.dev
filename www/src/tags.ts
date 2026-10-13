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

/** One list per folder in GROUPS order. Throws for a folder GROUPS does not list, so a tag can't silently vanish. */
export const orderTags = <T extends { id: string }>(tags: T[]): T[][] => {
  const group = (tag: T) => tag.id.split("/")[0];
  const unknown = tags.filter((tag) => !GROUPS.includes(group(tag)));
  if (unknown.length) {
    throw new Error(
      `Tag folders missing from GROUPS: ${unknown.map((tag) => tag.id).join(", ")}`,
    );
  }
  return GROUPS.map((name) => tags.filter((tag) => group(tag) === name));
};
