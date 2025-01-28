import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const clients = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/clients" }),
  schema: ({ image }) =>
    z.object({
      sortOrder: z.number(),
      asset: image(),
      href: z.string().url(),
      title: z.string(),
    }),
});

const social = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/social" }),
  schema: ({ image }) =>
    z.object({
      sortOrder: z.number(),
      asset: image(),
      href: z.string().url(),
      title: z.string(),
    }),
});

const tags = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tags" }),
  schema: z.object({
    title: z.string(),
    href: z.string().url(),
  }),
});

const openSource = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/open-source" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      asset: image(),
      href: z.string().url(),
    }),
});

export const collections = {
  clients,
  social,
  tags,
  "open-source": openSource,
};
