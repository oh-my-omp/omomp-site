# omomp-site 全站细节审阅与设计思路规范

## 一、 总体诊断：为什么全站显得“AI 味极重”且“像敷衍交差”

当前线上版本（`https://oh-my-omp.github.io/omomp-site/` 及其 `/zh/` 中文站）以及 `src/` 实现存在系统性质量问题。页面呈现出强烈的“大模型一键生成暗色落地页”廉价感，核心原因归结为以下五点：

1. **视觉模板套路化**：全站机械套用 `#0b0c0e` 黑底 + 脏黄紫双色径向光斑（`.glow`）+ 半透明灰渐变大字（`.gradient-text`）+ 橙色等宽大写 `.eyebrow` + 泛滥的 `01`–`06` 编号 + `#111216` 圆角灰框（Card Soup）。
2. **真实界面切片数量为零**：`docs/content-design.md:66, 203` 明确要求“每节下有几条要点，配一块真实界面切片”、“不做脱离真实运行结果的示意动画”。但全站除了纯文本会话框 `ReplayPlayer` 外，没有任何一块真实 UI 界面切片（`omp-ask-more` 全屏决策页、`omp-todo-more` 的 Tern 待办面板、`omp-unified-exec` 的 Tern 终端 HUD、`omp-playbooks` 的 Tern 卡片面板全部缺席），反而用 `src/components/RepoFigure.astro` 画了 4 张十来行代码的火柴盒 SVG 充数。
3. **生搬硬套内部测试/调试日志充当演示**：没有设计面向读者的可理解模拟演示，而是直接从本机历史里抠出修 bug 和跑 CI 冒烟探针的原始 JSON/文本日志（如 `PR #188`、`#applyToolPresentation`、`topology B`、`PROBE-RC-1`、`This is a bounded plugin runtime check... Stop and reply READY`），导致演示内容虚假、上下文断裂、中英混杂、极难阅读。
4. **全站文案陷入“AI 对偶口号腔”与翻译腔**：从 `h1`、`h2` 到卡片描述，几十处标题全部套用“不是 A，而是 B”、“每 X 一个 Y”的工整格言句式，中文版直接从英文隐喻硬翻并由 `src/middleware.ts` 强行注入 `<wbr>` 分词断行，读感生硬拗口。
5. **前期设计文档缺失视觉与交互的执行规范**：`docs/content-design.md` 只列出了信息目录（哪些页面、哪些名词）并点名了 `supabase.com` 与 `linear.app` 两个网址，却没有拆解两者的版式解剖学、图文面积比、网格形态与控件切片规范，还错误规定了“用 `omp-sessions` 从本机会话记录中检索、不改写不编造”，直接诱导实现者把表格填成灰框、把单测日志当成产品演示。

## 二、 参照基准失真对比：Supabase 与 Linear 到底差在哪

对照 `/tmp/omomp-site-work/refs/` 下抓取的真实 `supabase.com`（`desktop_supabase.com_*.png`）与 `linear.app`（`desktop_linear.app_*.png`）截图，当前实现只抄了“深色背景加圆角边框”，连两者核心设计语言的十分之一都没学到。

### 2.1 首页对照 Supabase（`desktop_supabase.com_.01`–`.03.png` vs `src/views/Home.astro`）

| 维度 | 真实 `supabase.com` 首页 | 当前 `omomp-site` 首页（`src/views/Home.astro`） |
| :--- | :--- | :--- |
| **首屏结构与纵深** | 首屏顶部是不对称左右分栏（左列两行双色实色标题 `Build in a weekend / Scale to millions` + 两个按钮；右列 3 行平实说明交代包含哪些产品，总高仅约 `320px`）。**在首屏 `y ≈ 380px` 处直接进入 7 张产品的 Bento 网格**，不滚动就能看到全部核心模块与界面缩略图。 | `Home.astro:43-100`：首屏用 `padding-top: clamp(80px, 14vw, 160px)` 居中堆放脏黄紫 `.glow` 光斑、半透明灰渐变标题和 6 格带 `›` 圆圈的 `.seam-strip`；紧接着塞入两个各占一屏的巨型分栏区（`Where it sits` 和 `Take what you need`），把真正核心的积木卡片区挤到 `y > 1500px` 的第 4 屏。 |
| **Bento 卡片内部构成** | 每张卡片遵循 **“30% 文字 + 70% 具象微缩界面”**：左上角仅放小图标、产品名和 2 行短句，卡片下半部或右半部 65%–70% 的面积是具象的 UI 控件切片（Postgres 卡内是特性勾选与结构图、Authentication 卡内是真实邮箱用户行 `alex16019@gmail.com`、Edge Functions 卡内是 `$ supabase functions deploy` 胶囊与地球网格、Data APIs 卡内是 `countries -> .../v1/countries` 映射组件）。 | `Home.astro:119-131`：6 张插件卡（`omp-ask-more` 到 `omp-thinking-translator`）是 **100% 纯文字黑灰框**（左上角 `<code>` 仓库名 + 中间两行灰字 + 底部 `Acts at 06 Delivery` 胶囊），连一个像素的界面切片或结构图都没有。3 张产品卡只放了简陋的 `320×88` 抽象灰条 SVG。 |
| **“按需取用”的表达方式** | Bento 网格正下方仅用一行高对比度的短句 `Use one or all. Best of breed products. Integrated as a platform.` 点题；第 2 屏（`desktop_supabase.com_.02.png`）用 `Table Editor / SQL Editor / RLS Policies` 胶囊切换器展示完整交互表单，旁配可切换 React/Next.js/Vue 图标的真实代码框。 | 把“按需取用”拆成一个占半屏高的独立双栏文字块（`Home.astro:80-100`），右边画一个顶栏带三个灰圆点的假终端框（`.term`），里面只放 4 行静态 `git clone` 文本，毫无信息量。 |

### 2.2 内页对照 Linear（`desktop_linear.app_*.png` vs `src/views/*.astro`）

| 维度 | 真实 `linear.app`（首页及 `/plan`、`/build`、`/intake`） | 当前 `omomp-site` 内页（`Principles` / `Lifeline` / `Seam` / `Product` / `Defaults`） |
| :--- | :--- | :--- |
| **字重、颜色与眉题** | 标题一律是 `#f7f8f8` **纯白实色左对齐**（`letter-spacing: -0.03em; line-height: 1.05`），绝不用白到灰的半透明文字渐变；章节上方的分类引导词是**正常大小写的克制浅灰小字**（如 `Planning and monitoring`、`Build, review and ship`），不刷橙色等宽大写编号。 | `PageHead.astro:12-13` 与 `global.css:125-145`：全站所有页面和章节一律刷 `12px` 橙色大写等宽 `.eyebrow` + `01`/`02`/`03` 编号 + `.gradient-text`（`linear-gradient(#fff 30%, #ffffff8c)`），导致两行中文标题下半截发灰发暗。 |
| **章节头部版式** | 每个大节顶部采用 **左标题（5 列宽）+ 右导语（6 列宽）的不对称双栏头部**（如 `desktop_linear.app_plan.01.png` 的 `Manage projects end-to-end` 左列标题 + 右列 `Coordinate larger pieces of work...` 说明与 `Projects +` 胶囊）。 | 所有内页章节全部是单栏堆叠：一行橙色数字 $\rightarrow$ 一行大标题 $\rightarrow$ 底下直接铺 3 个等宽纯文字圆角灰框。 |
| **主舞台真实界面切片** | 每个大节双栏头下方，必有一块占满 `1120px` 宽度的**高保真暗色 UI 界面舞台**（如 `UI Refresh` 项目视图、`Meeting notes` 多人文档编辑器配左侧 4 个特性切换项、`Core product` 战略进度表、带状态流转的 `Refactor sonic crawler` 工单页）。 | **全站内页的真实 UI 界面切片数量为 0**。无论是讲全屏决策面板的 Seam 01、讲待办面板的 Seam 03、还是讲 Playbook / Dispatch 的产品页，全靠干瘪的文字灰框硬撑。 |
| **1px 通栏细线网格（Hairline Grid）** | 大舞台下方的子特性区采用 **1px 通栏横竖细线（`border-top` / `border-left: 1px solid rgba(255,255,255,0.07)`）** 直接切分暗色画布。每个网格单元**上半部 70% 是局部放大的真实 UI 控件切片**（如 `Delegate to... Codex / Cursor` 菜单、并行工单状态行、`Off Track` 告警卡、里程碑依赖曲线），**下半部 30% 才是 1 行粗体小标题 + 2 行灰字**。 | 不用通栏细线网格，也不画上半部 70% 的控件切片，而是把所有文字塞进 `border-radius: 12px; background: #111216` 的独立圆角盒子里（如 `Product.astro:56-60` 的 `.point`），满屏全是重复的文字灰盒子。 |
| **抽象原则的架构图（`FIG 0.x`）** | `desktop_linear.app_.02.png` 展示三条抽象原则时，用 1px 竖线切出三列，每列左上角标 `FIG 0.1`–`FIG 0.3`，中间留出 `260px` 高度绘制**精密的等轴测几何架构线稿（Isometric Wireframe）**，底部放标题和三行说明。 | `Principles.astro:36-64` 把四条工程信条做成四段完全同构的“左列问题 + 右列三条短横线列表 + 底部胶囊框”文字墙，连一张前缀缓存或信号拦截的架构图都没有。 |

## 三、 示例与回放逐帧批判：生搬内部日志造成的虚假与不可读

`src/data/replay-sessions.json`、`src/data/replay.ts` 与 `src/islands/ReplayPlayer.tsx` 是全站可读性最差、表现最失真的重灾区。实现者没有针对读者构建直观的模拟场景，而是从本机历史里硬抠出几段内部维护、单测探针和调试 bug 的日志片段贴上页面。

### 3.1 生命线 8 个回放镜头的逐帧问题（`src/data/replay-sessions.json`）

1. **镜头 01（`id: "1"`，接缝 ① 意图，`omp-ask-more`，`replay-sessions.json:4-38`）**
   - **内部维护黑话，毫无外部可读性**：第 1 条事件直接贴 `PR #188 已达成重启保留缓存（行 #1 通过），但 polish_doc 激活后成了顶层工具而不是 xd://polish_doc 设备… OMP 18.17.0 session-tools.ts 的 #applyToolPresentation 把经 setActiveTools 传入…`。任何不了解当天内部 PR 上下文的读者根本无法理解。
   - **展示形态错误**：`omp-ask-more` 的核心价值是“全屏决策面板（现状、取舍、代码证据、演示动画）”，但这里展示的只是 `ask` 工具的原始 JSON 参数文本（`question: "..." \n brief.where: "..."`），完全没画出面板本身。
   - **“你看到的”视图失真**：切到 `你看到的（What you saw）` 时，`ReplayPlayer.tsx:40` 只过滤 `actor === "hook" || kind === "reminder"`，屏幕上依然裸露着 `AGENT ask` 原始参数字符串和 `ask rejected` 报错——人在真实终端或 Tern 里看到的绝不是这段参数文本，且被可读性检查退回的那次提问根本不会出现在人的屏幕上。

2. **镜头 02（`id: "prompt"`，接缝 ② 提示词，`tool-topics`，`replay-sessions.json:432-458`）**
   - **因果链条断裂**：第 1 条用户消息是中文 `每一个伞issue，派一个task high去处理，不需要告诉他们怎么处理…`；第 2 条代理调 `read(path="tool://task/limits")` 等三个 `task` 专题；第 3 条突然弹出 `tool://read/runtime` 的 `<tool-topic-injection>`（第 454 行）。前面读的是 `task` 专题，后面注入的却是 `read/runtime` 专题（因为中间调 `read(agent://...)` 的步骤被删掉了），整段演示在逻辑上完全接不上。

3. **镜头 03（`id: "memory"`，接缝 ③ 记忆，`omp-todo-more`，`replay-sessions.json:384-430`）**
   - **拿插件自身的改写调试日志充数**：内容是 `todo-more rewritten on branch with native todo as base (topology B)`、等待 `session 9` 构建沙箱。第 1 条代理说中文（第 392 行），第 5 条代理突然改说英文（第 419 行）。
   - **不见面板，只见协议字符串**：完全没有展示 `omp-todo-more` 在 Tern 里的待办面板（阶段分组、时间预算、进度条、自动提交），只给读者看大段 `<system-reminder>` 原文和 `todo(input="*** Begin Todo\nDONE ...")` 的原始命令。

4. **镜头 04（`id: "2"`，接缝 ④ 派发，`user-prompt-inject` / `discuss:steady`，`replay-sessions.json:40-66`）**
   - **半截话 + 中英混杂**：第 1 条用户消息是前后带省略号的半截话 `…后者的每任务cost要作为预先写死的数据直接存在插件中，而不是每次全量计算。…`；第 2 条主代理 brief 是英文 `Fallback: per-dispatch cost 'unit price' computed ONCE now...`；第 3 条顾问回复又是中文讨论 `方案 C 硬编码 input/output/cache token profile` 与 `mu0`。读者既不知道“后者”指什么，也不知道“方案 C”从何而来。

5. **镜头 05（`id: "3"`，接缝 ④ 派发，`isolation-nudge` / `task-split-check`，`replay-sessions.json:68-116`）**
   - **违背页脚“未改写”声明**：`src/copy/pages.ts:58` 声明 `Nothing is reworded or invented; every line comes from a session log`，但第 77、91、105 行的事件正文却是手写浓缩过的伪调用摘要：`task(5 × task:mid: UpdaterOwnership, ExtensionsDocs, ...)` 和 `task(the same 5 items, isolated: false)`。既没有展示真实派发参数的结构，又顶着“原始日志逐行摘录”的虚假包装。

6. **镜头 06（`id: "4"`，接缝 ⑤ 执行，`tool-policy-nag` / `delete-guard`，`replay-sessions.json:118-165`）**
   - **把两个毫无关联的会话硬拼成一帧**：前 5 步来自 `2026-10-16` 跑 `software-design check /tmp/sd-demo` 与 `perl -0pi -e` 改文件的会话；第 6 步突然跳到 `2026-10-30` 另一个测试会话的 `eval(py) import shutil; shutil.rmtree("/tmp/omp-dg-c3/d")`。
   - **连日志里的病句缺词都原样照搬**：第 141 行 `应该用 拆开：读走 read / glob / grep`（“用”和“拆开”之间原本漏了词留了空格）一字不改直接发上官网。

7. **镜头 07（`id: "5"`，接缝 ⑤ 执行，`omp-unified-exec`，`replay-sessions.json:167-208`）**
   - **用自动化回归探针冒充交互终端体验**：5 条事件全是 `write_stdin(session_id=2, chars="PROBE-RC-1 读 notes.txt 回复内容\r") ok` 这种内部探针调用。既没有终端屏幕输出，也没有 Tern 终端 HUD 面板，更看不到人如何与代理共用同一个长驻终端。

8. **镜头 08（`id: "6"`，接缝 ⑥ 交付，`task-completion-judge` / `turn-judge`，`replay-sessions.json:210-244`）**
   - 同样把 `2026-11-04` 的 `ToolPolicyNagAudit` 子代理退回与 `2026-10-24` 的主会话 `turn-judge` 提醒硬拼在一起；第 219 行 `yield(type="result", data.report=…audit of tool-policy-nag lanes…)` 又是手写摘要，内容围绕内部模型回退顺序（`deepseek-v4.1-flash` vs `gpt-6-luna`），极难阅读。

### 3.2 三个独立产品页回放镜头的偷懒问题（`replay-sessions.json:246-382`）

- **`omp-playbooks`（第 246–292 行）与 `omp-remote-build`（第 336–382 行）直接搬运了 CI 冒烟测试指令**：
  - `playbooks` 第一条用户消息是：`This is a bounded plugin runtime check. Read xd://playbook_edit and all of its topics... Stop and reply READY once done.`，随后是 `write(path="xd://playbook_open", content="{\"doc\":\"/tmp/omp-playbooks-e2e-en/book.yaml\"}")` 等 4 条 JSON RPC 探针，最后代理回复 `READY — checks performed: ...`。
  - `remote-build` 第一条用户消息是：`Call remote_env_init once. Then call container_exec once with input "cat hello.txt; echo EXIT=$?\n" and yield_time_ms 10000...`。
  - 把单测脚本验证接口存活的生硬 JSON 往返当成旗舰产品的核心演示，把“人机共创的可执行设计文档”和“多 Worktree 远端容器同步构建”降格成了无聊的字符串回显。

### 3.3 `ReplayPlayer.tsx` 播放器的交互与双语缺陷

1. **初始状态即为结束态（`ReplayPlayer.tsx:46`）**：`useState((props.shots[0]?.events.length ?? 1) - 1)` 让页面一加载就把所有事件全部铺开，底部进度条停在 `100%`（如 `4 / 4`），主按钮显示 `Replay / 重播`，完全丧失了按步推进、观察拦截发生瞬间的叙事感。
2. **中英文双语站共用同一份混杂日志**：英文站读者看到大段中文 prompt 和中文拦截消息，中文站读者看到大段英文测试指令与英文报错，语言体验割裂。

## 四、 全站逐页、逐组件视觉与代码细节批判

### 4.1 全局骨架、字体、动画与中文断行（`Base.astro` / `global.css` / `Logo.astro` / `Pager.astro` / `middleware.ts`）

- **`Logo.astro`（第 12–19 行）**：在 `viewBox="0 0 64 40"` 内用 `stroke-width="5"` 画了 `>`、变形的 `π` 以及右下角一个小插头（`rect x="46" y="27" width="6" height="9"` 加两根 `stroke-width="2.4"` 的短线）。缩放到页头 `32×20` 和页脚 `25.6×16` 时，右下角插头直接糊成一个无法辨认的橙色疙瘩。
- **`.reveal` 滚动淡入动画（`Base.astro:58-69`、`global.css:195-204`）**：全站所有 `<section>` 默认 `opacity: 0; transform: translateY(14px)`，依靠 `rootMargin: "0px 0px -8% 0px"` 触发 `0.6s` 过渡。用户快速滚屏时，视野里的区块大面积处于半透明残影状态。
- **`middleware.ts` 的中文 `<wbr>` 强行切词（第 11–36 行）**：在构建期用 `Intl.Segmenter("zh", { granularity: "word" })` 往所有中文 `h1`–`h4` 词间塞满 `<wbr>`，配合 `global.css:107-111` 的 `:lang(zh) :is(h1,h2,h3,h4) { word-break: keep-all }`。在双栏窄容器里把自然中文标题切得支离破碎（如首页 `omomp 叠在` / `你已在用的代理` / `和终端之上`）。
- **`Pager.astro`（第 22–98 行）**：每个内页底部的上一页/下一页导航用了两个 `#111216` 圆角灰框，外观与正文里的 `.card`、`.point` 完全相同，缺乏页脚导航与正文卡片的层级区分。

### 4.2 首页各区块细节（`Home.astro` / `HostDiagram.astro` / `RepoFigure.astro`）

- **Hero 区（`Home.astro:43-69, 200-305`）**：
  - `.glow`（第 207–218 行）用 `radial-gradient(40% 50% at 50% 40%, rgb(247 168 35 / 0.16), transparent 70%)` 叠在 `#0b0c0e` 上，形成一团浑浊的脏黄褐色背景雾。
  - `.seam-strip`（第 53–67、246–305 行）：6 个方格之间的分割线上贴了 5 个 `18×18px` 的小圆圈，里面塞 `13px` 的橙色 `›`（`li:not(:last-child)::after`），视觉琐碎且陈旧；到了移动端（`mobile_omomp-site_zh_.01.png`）切成 2×3 网格后直接把圆圈箭头隐藏，退化成 6 个死板的文字格子。
- **宿主边界图 `HostDiagram.astro`（第 13–94 行）**：
  - 所谓“关系图”，只是上方放一个带 `box-shadow: 0 0 60px -20px` 橙色外发光的圆角框（`oh-my-omp`），中间画两根 `height: 28px; width: 1px` 的竖线（`.hd-links span`），下方并排两个圆角框（`Oh My Pi` 与 `Tern`）。三个大号空框占掉半屏高度，连三者之间的扩展挂载与面板渲染关系都没表达出来。
- **假终端框 `.term`（`Home.astro:85-99, 326-374`）**：
  - 顶栏画三个无意义的 `#ffffff1f` 灰圆点（`.term-bar i`），里面只有 4 行命令文本，却占用了与左侧大标题等宽的巨型容器。
- **火柴盒配图 `RepoFigure.astro`（第 14–159 行）**：
  - `figure === "seams"`（第 16–29 行）：在 `omp-config` 宽卡片右侧画一条横线串 6 个标着 `01`–`06` 的圆点，而卡片左侧（`Home.astro:111-115`）紧挨着列出了 `01 Intent` 到 `06 Delivery` 六个胶囊——**同一个框内左右两侧把 `01`–`06` 重复写了两遍**。
  - `playbooks` / `dispatch` / `remote-build`（第 32–95 行）：在 `320×88` 的画布里用 `height="8"` 的灰条（`.bar`）和几个圆点代替界面，卡片背景还叠了一层紫色径向渐变（`radial-gradient(80% 60% at 100% 0%, rgb(195 177 251 / 0.1), transparent 70%)`），显得粗糙且廉价。
- **底部 `Tenets` 与 `Next` 区（`Home.astro:166-196`）**：
  - `Four rules` 是 4 列顶边框线加 `01`–`04` 编号；紧接着 `Start from a question` 又是 5 行带底边框线的问答列表。页面后半段全是单调的线条与文字列表。

### 4.3 设计原则页（`Principles.astro` / `principles.yaml`）

- **顶部冗余目录 `.toc`（第 24–33、74–109 行）**：在已经很短的页面顶部放了 4 个胶囊锚点（`01 只追加，不改写` 等），往下百余像素就是完全相同的四节标题。
- **四节完全同构的文字墙（第 36–64 行）**：每一节固定是橙色 `01` $\rightarrow$ `h2` $\rightarrow$ 左列 `THE PROBLEM` 一段话 + 右列 `IN PRACTICE` 三条带橙色短横线 `–` 的要点 $\rightarrow$ 底部一条 `.seen` 灰框塞几个组件胶囊。连续重复 4 次，没有任何视觉图表支撑。

### 4.4 生命线总览页与交互矩阵（`Lifeline.astro` / `LifelineMap.tsx` / `islands.css`）

- **顶部三层说明卡与下方过滤器的重复（`Lifeline.astro:23-58`）**：上方刚用三个带顶部亮边的圆角框写完 `Human surface` / `Agent primitives` / `Silent governance`，紧接着下方矩阵过滤栏又把这三个词作为胶囊按钮列一遍。
- **`LifelineMap.tsx` 矩阵的排版缺陷（`islands.css:34-160`）**：
  - 桌面端最左列 `.lm-rowlabels` 宽度仅有 `34px`，把层级名称旋转 180 度竖排塞进去（`writing-mode: vertical-rl; transform: rotate(180deg); font-size: 11.5px`），极难辨认。
  - 6×3 网格内部堆满 `11.5px` 的等宽小胶囊（`.lm-chip`），视觉像密集的后台权限配置表；点击第一行的胶囊时，解释文字却渲染在整个大表格底部的 `.lm-detail` 框里（`LifelineMap.tsx:140-158`），视线被迫跨过整张表来回跳跃。

### 4.5 六个接缝子页（`Seam.astro` / `seams.yaml` / `components.yaml`）

- **顶部进度条（`Seam.astro:29-31, 87-105`）**：6 个 `28×3px` 的小横条（`.steps a`），无文字、无悬停提示，像坏掉的轮播指示器。
- **层级列表空旷且重复（`Seam.astro:35-61, 107-179`）**：左列 `220px` 放发光圆点加层级名，右列先放一句 `21px` 的 `.layer-prose`，下面再放 `.card` 灰框。当某层只有 1 个组件时（如 Seam 01 的 `ask` 和 `readability`），右列 `900px` 宽的区域里孤零零躺着一个纯文字框，框内 `.solves`（粗体）和 `.does`（灰字）还在把同一件事换个句式说两遍。

### 4.6 三个独立产品页（`Product.astro` / `products.yaml`）

- **四方角色框 `.parties` 的拓扑错误（`Product.astro:39-49, 117-163`）**：把四个角色（如 `你`、`协调者`、`文档服务`、`子代理`）放进 4 个带彩色顶边的圆角框排成一行，中间用 `14px` 的水平短线（`li:not(:last-child)::after`）串联成单向链条。但这四方是星型/事件驱动交互，根本不是从左到右的单向流水线。
- **正文三节 `.sec` 的模具化（`Product.astro:52-62, 165-193`）**：每节固定是橙色 `01` / `02` / `03` + `h2` + 3 个等宽纯文字圆角框 `.point`。三个核心机制完全不同的独立产品（`Playbooks`、`Dispatch`、`Remote Build`），页面结构长得像同一张填空试卷。

### 4.7 默认策略索引页（`Defaults.astro`）

- 全页只是把 `components.yaml` 里的 `defaults.mechanism` 和 `defaults.policy` 渲染成一张 4 列纯文字表（`220px 1fr 1.25fr auto`），既没有配置片段示例，也没有展示如何用三方合并覆盖默认策略。

### 4.8 全站中英文文案的“AI 对偶口号病”与翻译腔（`src/copy/` & `src/data/*.yaml`）

- `docs/content-design.md:88-91` 原本使用的是平实的工程语言（`增量追加，保持提示前缀不变`、`不靠静态提示词，靠可观测信号纠偏`、`权威源头单一，编排、执行、顾问分离`、`机制与默认策略分离`）。
- 到了 `src/copy/` 和 `src/data/*.yaml` 中，全站标题被改写成了千篇一律的“AI 对仗金句”，再硬翻回中文：
  - `Your intent survives every handoff` / `你的意图，几经转手也不走样`
  - `Append, never rewrite` / `只追加，不改写`
  - `Correct on signals, not prose` / `靠信号纠偏，不靠说教`
  - `Mechanism shipped, policy yours` / `机制随仓库，策略归你`
  - `A question worth asking is worth a full screen` / `值得问的问题，值得占满一屏`
  - `The plan outlives the context window` / `计划比上下文窗口活得久`
  - `Workers get a brief. Advisors get your words` / `执行者拿到派工单，顾问拿到你的原话`
  - `Done means checked, not announced` / `做完是验过，不是说过`
  - `The button asks, the coordinator decides` / `按钮只是请求，协调者做决定`
  - `Edit here. Build there` / `这边改，那边构建`
- 当全站几十个标题全部采用同一套正反排比修辞时，直接散发出浓烈的 AI 批量生成感。

## 五、 缺失的设计思路要求：Supabase、Linear 与模拟演示的硬性规范

要根治“无设计思路、乱套 AI 模板、演示不可读”的问题，必须把“参照 Supabase 与 Linear”细化为以下可检验的版式、卡片、切片与模拟演示规范。

### 5.1 首页抄 Supabase 的四条版式与卡片铁律（对照 `desktop_supabase.com_.01`–`.03.png`）

1. **首屏不对称双栏 + 第一屏直接进 Bento 网格**
   - 废除居中渐变大字、废除 `.glow` 脏黄紫背景光斑、废除首屏底部的 6 格 `.seam-strip`，不在积木网格前塞占满两屏的文字区。
   - 首屏顶部采用左右不对称分栏（高度控制在 `320px` 内）：左列两行高对比实色主标题 + 两个操作按钮；右列 3 行平实导语交代 `omomp` 在 `omp` 与 `Tern` 之上的定位。
   - 首屏 `y ≈ 380px` 处直接铺开核心积木 Bento 网格，让读者在第一屏不滚动即可看到全部核心模块及其界面形态。

2. **Bento 卡片内部严格执行“30% 文字 + 70% 具象微缩界面”**
   - 严禁出现纯文字卡片或 `RepoFigure.astro` 那种抽象灰条 SVG。
   - 每张卡片左上角仅放组件名 + 两行以内说明（中文不超过 35 字，英文不超过 22 词）；**卡片下半部或右半部 65%–70% 的面积必须内嵌高辨识度的真实 UI 控件微缩切片**：
     - `omp-config`（跨列主卡）：左侧写治理运行时职责，右侧画一条带 6 个接缝拦截点与三层色彩标记的实时工具链管道切片（显示 `<system-reminder>` 追加与 `block / judge` 触发点），不重复罗列两次 `01`–`06`。
     - `omp-ask-more`：内嵌全屏决策面板微缩切片（含 `Where / What / How` 栏、两个带 `Tradeoff` 对比的选项卡片及推荐高亮）。
     - `omp-todo-more`：内嵌 Tern 待办面板微缩切片（含 `PHASE` 分组、`15m` 预算标签、已完成项旁绑定的 git commit SHA）。
     - `omp-unified-exec`：内嵌 Tern 终端 HUD 微缩切片（含运行中 PTY 会话标签、`Agent` 与 `You` 共用输入指示）。
     - `omp-sessions`：内嵌 `session://` 路径与 DuckDB SQL 查询结果表微缩切片。
     - `omp-peers`：内嵌多进程会话在线列表与 `peer_ask` 旁路问答气泡切片。
     - `omp-thinking-translator`：内嵌思考流原文与实时中文译文双行对照切片。
     - 三个独立产品卡（`omp-playbooks`、`omp-dispatch`、`omp-remote-build`）：占大尺寸卡片，分别内嵌“YAML 块与 Tern 卡片双栏视图”、“Issue 树到独立 Owner/Judge 状态流转轨”、“本机多 Worktree 到远端容器镜像映射面板”。

3. **“宿主边界与按需取用”合并为交互式切换舞台（参照 `desktop_supabase.com_.02.png`）**
   - Bento 网格下方用一句精炼桥接语点明“单装一个插件，或整套接入”。
   - 紧接一个带胶囊 Tab 切换的交互式舞台（`单装插件` / `接入 omp-config 完整治理` / `搭配 Tern 图形终端`）：左侧展示对应的真实终端/面板工作界面与三者挂载拓扑，右侧展示对应的安装与启动命令。

4. **去装饰化描边与色彩纪律**
   - 卡片与微缩组件统一使用 `1px` 精细结构描边（`rgba(255,255,255,0.08)`）和局部高亮边框，移除大面积斜向彩色背景渐变与高饱和外发光阴影。

### 5.2 内页抄 Linear 的四层构图与网格铁律（对照 `desktop_linear.app_*.png`）

1. **纯白左对齐标题 + 克制眉题 + 章节不对称双栏头（Split Section Header）**
   - 全站移除 `.gradient-text` 半透明灰渐变，所有 `h1`/`h2` 采用 `#f7f8f8` 纯白实色左对齐；分类眉题改为正常大小写的浅灰字（`13px`，`#8a8f98`），废除全站刷屏的橙色大写等宽 `.eyebrow` 与泛滥的 `01`–`06` 编号。
   - 内页每个大节顶部采用 **左列 `H2` 标题（5 列宽）+ 右列机制说明与组件跳转胶囊（6 列宽）** 的不对称双栏排布。

2. **大节主舞台：全宽真实界面切片（Primary UI Stage）**
   - 每个大节双栏头部下方，必须放置一块 `1120px` 全宽度的暗色界面舞台（带顶部微光描边与内部真实控件布局），直观呈现该节核心机制的运行画面，可带左侧或顶部特性切换按钮（参照 `desktop_linear.app_plan.03.png` 的 `Meeting notes` 舞台）。

3. **子要点区：1px 通栏细线网格 + 上图下文（Hairline Grid，参照 `desktop_linear.app_plan.02.png`、`build.02.png`）**
   - 废除内页里一排 3 个纯文字圆角灰框（`.point` / `.card`）的做法。
   - 改用 `1px solid rgba(255,255,255,0.07)` 的横竖通栏细线直接切分暗色画布（2 列或 3 列）。
   - **每个网格单元内部**：**上半部 70% 面积放置局部放大的高保真 UI 控件/协议切片**，**下半部 30% 面积放置 1 行粗体小标题 + 2 行浅灰说明**。

4. **抽象原则页：配 `FIG 0.1`–`FIG 0.4` 精密架构图（参照 `desktop_linear.app_.02.png`）**
   - 设计原则页（`Principles`）用 1px 通栏细线切分，每条工程信条配一张 `240px–280px` 高的精密架构图：
     - `FIG 0.1（增量追加与前缀缓存）`：对比“原地改写 System Prompt 导致缓存失效”与“锁定前缀 + 尾部追加 `<system-reminder>` 与工具差分消息保持缓存命中”的字节流结构图；
     - `FIG 0.2（可观测信号纠偏）`：画出 `tool_call`、`tool_result`、`subagent yield`、`turn end` 四个钩子挂载点如何捕获偏离信号并注入 `block / reminder` 的回路图；
     - `FIG 0.3（编排、执行、顾问分离）`：画出用户原话经 `user-prompt-inject` 直达只读顾问（`discuss:*` / `mentor:default`）、主代理向无状态 `task:*` 派发隔离 Worktree 的权限边界图；
     - `FIG 0.4（机制与默认策略分离）`：画出扩展固定机制（作用域条件 + 执行动作）与仓库随附策略示例经三方合并保留用户本地定制的结构图。

### 5.3 模拟演示与高保真界面切片的设计规范（取代原始日志搬运）

废除“从 `omp-sessions` 捞原始调试/单测日志原样照搬”的做法，改为 **“一条统一、易懂的真实工程任务贯穿全站 + 双视角分屏交互模拟”**：

1. **用同一条干净的工程场景贯穿 6 道接缝**
   - 选用任何开发者都能在 3 秒内读懂的真实开发任务（例如：**“为 API 网关增加 Redis 速率限制中间件，并同步更新三个下游调用模块”**），中英文站点各自提供地道、完整的对应语言版本（严禁中英混杂、严禁内部 PR 编号和 `/tmp/...` 探针路径）：
     - **接缝 ① 意图**：展示代理初次提问因含混缩写被 `readability` 退回，随即在右侧直接渲染出 **`omp-ask-more` 全屏决策面板的完整 HTML/CSS 界面**（含现状、取舍、代码行证据与推荐项）。
     - **接缝 ② 提示词**：用可视化上下文条展示完整模式 vs 轻量模式的挂载差异，以及代理调用 `task` 前按需拉取 `tool://task/isolation`、以增量消息注入而不改动 System Prompt 前缀的过程。
     - **接缝 ③ 记忆**：左侧渲染 **Tern 的 `omp-todo-more` 待办面板实体界面**，右侧同步展示代理在剩 1 项未完时试图停下、被停止提醒拉回继续完成并自动触发 `git commit` 的闭环。
     - **接缝 ④ 派发**：左侧展示 3 个写文件任务混入同一工作区且混装多主题时被 `isolation-nudge` 与 `task-split-check` 拦截的红框对比；右侧展示拆分为 3 个 `isolated: true` 独立 Worktree 后的并行状态，以及顾问直接引用用户原话指出方案偏差的画面。
     - **接缝 ⑤ 执行**：渲染 **Tern 的 `omp-unified-exec` 终端 HUD 界面**（展示代理 `write_stdin` 与人工按键同屏操作同一长驻终端），并列展示 `delete-guard` 拦下 `shutil.rmtree` 改走回收站 `delete` 工具、`tool-policy-nag` 纠偏长串 shell 改文件的界面切片。
     - **接缝 ⑥ 交付**：渲染 `omp-thinking-translator` 实时双语思考流面板、`task-completion-judge` 退回未跑验证的子代理交付卡片，以及 `omp-sessions` 用 DuckDB SQL 检索历史会话的查询表格。

2. **三个独立产品页用真实工作流舞台取代 CI 探针日志**
   - **`omp-playbooks`**：主舞台渲染左栏 Tern Playbook 卡片编辑器（设计块、带引用标签的执行块、`Launch` 请求按钮）+ 右栏协调者编译冻结 Prompt、派发子代理并将状态写回 YAML 的联动视图。
   - **`omp-dispatch`**：主舞台渲染左侧 GitHub Issue 树（父 Issue 与子工单依赖图）+ 中间工单状态机轨道（`Coding -> PR -> CI -> Review -> Merge`）+ 右侧“新 push 自动作废旧审批、全新 Judge 会话绑定精确 commit SHA 裁决”的看板视图。
   - **`omp-remote-build`**：主舞台渲染左侧本机多个 Git Worktree 编辑状态 $\rightarrow$ 中间 Mutagen 单向同步流 $\rightarrow$ 右侧远端主机对应 Komodo 容器内执行编译与测试的终端视图。

3. **`ReplayPlayer` 升级为“前台界面 + 后台钩子”双视角分屏模拟器**
   - 默认停在第 1 步（支持点击步骤条或播放推进，不再一上来停在最后一步）。
   - 采用**左右分屏联动**：左屏渲染“人在终端 / Tern 面板里实际看到的界面变化”，右屏同步高亮“同一时刻后台钩子注入的 `<system-reminder>`、拦截原因或 Judge 裁决”，让“静默治理如何改变前台行为”一目了然。

### 5.4 文案与排版规范

1. **去口号化**：废除全站强制押韵和对仗的“AI 金句”，回归 `docs/content-design.md` 原本准确、平实的工程说明；删除每个组件卡片里 `.solves` 与 `.does` 同义反复的凑字数写法，合并为一句写清“触发时机 + 具体动作 + 结果”。
2. **移除 `src/middleware.ts` 的 `<wbr>` 注入**：去掉对中文标题的自动分词插 `<wbr>` 逻辑，通过控制标题字数与自然的句子结构实现干净排版。
