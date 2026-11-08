import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";

export default defineConfig({
  site: "https://oh-my-omp.github.io",
  base: "/omomp-site",
  trailingSlash: "always",
  integrations: [solid()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: { prefixDefaultLocale: false },
  },
});
