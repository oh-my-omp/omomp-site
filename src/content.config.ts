import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const text = z.object({ en: z.string().min(1), zh: z.string().min(1) }).strict();
const layer = z.enum(["human", "agent", "silent"]);
const seamId = z.enum(["intent", "prompt", "memory", "delegation", "execution", "delivery"]);

/** A component: a plugin repo, an omp-config extension, or an agent role. */
const components = defineCollection({
  loader: file("src/data/components.yaml"),
  schema: z
    .object({
      name: z.string(),
      repo: z.url(),
      layer,
      seam: seamId,
      solves: text,
      does: text,
      /** Present only for components whose docs separate fixed mechanism from shipped defaults. */
      defaults: z.object({ mechanism: text, policy: text, customize: z.url() }).strict().optional(),
    })
    .strict(),
});

const seams = defineCollection({
  loader: file("src/data/seams.yaml"),
  schema: z
    .object({
      order: z.number().int().positive(),
      name: text,
      claim: text,
      drift: text,
      sections: z
        .object({ human: text, agent: text, silent: text })
        .strict(),
      replay: z.number().int().positive().optional(),
    })
    .strict(),
});

const products = defineCollection({
  loader: file("src/data/products.yaml"),
  schema: z
    .object({
      order: z.number().int().positive(),
      name: z.string(),
      repo: z.url(),
      tagline: text,
      claim: text,
      intro: text,
      sections: z.array(z.object({ title: text, points: z.array(text).min(1) }).strict()).min(1),
    })
    .strict(),
});

const principles = defineCollection({
  loader: file("src/data/principles.yaml"),
  schema: z
    .object({
      order: z.number().int().positive(),
      title: text,
      short: text,
      summary: text,
      problem: text,
      practice: z.array(text).min(1),
    })
    .strict(),
});

export const collections = { components, seams, products, principles };
