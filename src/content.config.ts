import { defineCollection, reference } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const text = z.object({ en: z.string().min(1), zh: z.string().min(1) }).strict();
const layer = z.enum(["human", "agent", "silent"]);
const seamId = z.enum(["intent", "prompt", "memory", "delegation", "execution", "delivery"]);
const party = z.object({ name: text, role: text }).strict();
const section = z.object({ title: text, lede: text }).strict();

const components = defineCollection({
  loader: file("src/data/components.yaml"),
  schema: z
    .object({
      name: z.string(),
      repo: z.url(),
      layer,
      seam: seamId,
      line: text,
      defaults: z.object({ mechanism: text, policy: text, customize: z.url() }).strict().optional(),
    })
    .strict(),
});

const seams = defineCollection({
  loader: file("src/data/seams.yaml"),
  schema: z
    .object({
      order: z.number().int().positive(),
      short: text,
      name: text,
      claim: text,
      drift: text,
      sections: z
        .object({ human: section, agent: section, silent: section })
        .strict(),
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
      headline: text,
      tagline: text,
      intro: text,
      sections: z.array(z.object({ title: text, points: z.array(text).min(1) }).strict()).min(1),
      roles: z
        .object({
          hub: party,
          around: z.array(party.extend({ edge: text, dir: z.enum(["out", "in", "both"]) }).strict()).min(2),
        })
        .strict(),
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
      seen: z.array(reference("components")).min(1),
    })
    .strict(),
});

export const collections = { components, seams, products, principles };
