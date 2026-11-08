import { defineMiddleware } from "astro:middleware";

const han = /\p{Script=Han}/u;
const words = new Intl.Segmenter("zh", { granularity: "word" });

/**
 * Marks the boundaries between Chinese words, so `word-break: keep-all` wraps between words and never inside one.
 * Two one-character segments in a row are glued, since the segmenter's dictionary splits words it lacks (转手, 走样)
 * that way; and no boundary strands one character at either end of a run, where it would read as an orphan.
 */
function hintBreaks(text: string): string {
  const segs = Array.from(words.segment(text), (s) => s.segment);
  const isHan = (i: number) => i >= 0 && i < segs.length && han.test(segs[i]!);
  let out = segs[0] ?? "";
  for (let i = 1; i < segs.length; i++) {
    const prev = segs[i - 1]!;
    const cur = segs[i]!;
    const glued = prev.length === 1 && cur.length === 1;
    const strandsEnd = cur.length === 1 && !isHan(i + 1);
    const strandsStart = prev.length === 1 && !isHan(i - 2);
    if (isHan(i - 1) && isHan(i) && !glued && !strandsEnd && !strandsStart) out += "<wbr>";
    out += cur;
  }
  return out;
}

/** Chinese headings: browsers have no Chinese word segmentation, so the build supplies the break opportunities. */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!context.url.pathname.includes("/zh/") || !response.headers.get("content-type")?.startsWith("text/html")) return response;
  const html = (await response.text()).replace(
    /(<h[1-4]\b[^>]*>)([\s\S]*?)(<\/h[1-4]>)/g,
    (_, open: string, inner: string, close: string) =>
      open + inner.split(/(<[^>]+>)/).map((part) => (part.startsWith("<") ? part : hintBreaks(part))).join("") + close,
  );
  return new Response(html, response);
});
