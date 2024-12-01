import { defineCollection, z } from "astro:content";

const clientCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      sortOrder: z.number(),
      asset: image()
        .refine((img) => img.format === "svg", {
          message: "Client asset must be SVGs",
        })
        .refine((img) => img.width === 200 && img.height === 200, {
          message: "Client asset svg must have 200x200 width and height",
        }),
      href: z.string().url(),
      title: z.string(),
    }),
});

const socialCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      sortOrder: z.number(),
      asset: image()
        .refine((img) => img.format === "svg", {
          message: "Social asset must be SVGs",
        })
        .refine((img) => img.width === 16 && img.height === 16, {
          message: `Social asset svg must have 16x16 or 1em x 1em width and height.`,
        }),
      href: z.string().url(),
      title: z.string(),
    }),
});

const tagsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    href: z.string().url(),
  }),
});

const openSourceCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    href: z.string().url(),
  }),
});

export const collections = {
  clients: clientCollection,
  social: socialCollection,
  tags: tagsCollection,
  "open-source": openSourceCollection,
};
