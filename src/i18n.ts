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

export function asset(path: string): string {
  return `${base}${path}`;
}
