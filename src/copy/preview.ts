import type { Text } from "../i18n";

/** Copy shared by the two candidate home pages, so they differ in how they show the product, not in what they say first. */
export const preview = {
  hero: {
    /** Two lines; the second is set in the accent colour. */
    title: [
      { en: "Keep the agent on what you asked", zh: "让编码代理按你说的做" },
      { en: "Correct it the moment it drifts", zh: "偏离时当场纠正" },
    ],
    lede: {
      en: "omomp runs on the Oh My Pi (omp) coding agent and the Tern terminal: omp-config checks each handoff, plugins add tools and panels, and products run whole workflows.",
      zh: "omomp 运行在 Oh My Pi（omp）编码代理和 Tern 终端之上：omp-config 在每次交接处做检查，插件补上工具和面板，独立产品承担完整的工作流。",
    },
    primary: { en: "See the demo", zh: "查看演示" },
    secondary: { en: "Walk the lifeline", zh: "浏览生命线" },
  },
} as const satisfies { hero: { title: readonly [Text, Text]; lede: Text; primary: Text; secondary: Text } };
