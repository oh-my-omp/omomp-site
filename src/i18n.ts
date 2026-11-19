export const locales = ["en", "zh"] as const;
export type Lang = (typeof locales)[number];

export type Text = Readonly<Record<Lang, string>>;

export function t(text: Text, lang: Lang): string {
  return text[lang];
}

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function href(route: string, lang: Lang): string {
  const prefix = lang === "en" ? "" : `/${lang}`;
  return `${base}${prefix}${route}`;
}

export function routeOf(pathname: string): string {
  let rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  for (const lang of locales) {
    if (lang !== "en" && (rest === `/${lang}` || rest.startsWith(`/${lang}/`))) {
      rest = rest.slice(lang.length + 1);
    }
  }
  return rest === "" ? "/" : rest;
}

export function inlineCode(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function emphasis(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replaceAll("\n", "<br>");
}

export function keepNamesWhole(html: string): string {
  return html.replace(/[a-z]+(?:-[a-z]+)+/g, '<span style="white-space:nowrap">$&</span>');
}

export function wholeNames(s: string): string {
  return keepNamesWhole(s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
}
