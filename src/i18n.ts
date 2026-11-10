export const locales = ["en", "zh"] as const;
export type Lang = (typeof locales)[number];

/** A string written once per locale. */
export type Text = Readonly<Record<Lang, string>>;

export function t(text: Text, lang: Lang): string {
  return text[lang];
}

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site-relative route (`/lifeline/intent/`) → href for `lang`, base path included. */
export function href(route: string, lang: Lang): string {
  const prefix = lang === "en" ? "" : `/${lang}`;
  return `${base}${prefix}${route}`;
}

/** Strips base and locale prefix from a pathname, returning the site-relative route. */
export function routeOf(pathname: string): string {
  let rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  for (const lang of locales) {
    if (lang !== "en" && (rest === `/${lang}` || rest.startsWith(`/${lang}/`))) {
      rest = rest.slice(lang.length + 1);
    }
  }
  return rest === "" ? "/" : rest;
}

/** Escapes HTML, then renders `backtick` spans as <code>. Copy is authored in this repo, never user input. */
export function inlineCode(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/**
 * Escapes HTML, then renders `**phrase**` spans as <b> (the few words of a card line that carry it) and a
 * newline as a line break, for a Chinese line that must break at its comma.
 */
export function emphasis(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replaceAll("\n", "<br>");
}

/** Keeps each hyphenated name (`omp-config`, `oh-my-omp`) in already-escaped HTML on one line. */
export function keepNamesWhole(html: string): string {
  return html.replace(/[a-z]+(?:-[a-z]+)+/g, '<span style="white-space:nowrap">$&</span>');
}

/** Escapes HTML, then keeps each hyphenated name (`omp-config`, `oh-my-omp`) on one line. */
export function wholeNames(s: string): string {
  return keepNamesWhole(s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
}
