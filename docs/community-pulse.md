# Community Pulse · 数据与维护说明

> [!NOTE]
> **适用范围**：本仓库 Community Pulse 的数据统计与维护。完整的验证命令与参数集中维护于 [本地验证](#本地验证)，其他文档中的简要说明以该小节为准。

组织主页的 **Community Pulse** 由本仓库自动生成，并非第三方统计卡片。

- 生成器：[`scripts/update-community-pulse.mjs`](../scripts/update-community-pulse.mjs)
- 工作流：[`community-pulse.yml`](../.github/workflows/community-pulse.yml)
- 本地输出：`_site/community-pulse.svg`（浅色）、`_site/community-pulse-dark.svg`（深色）；`_site/` 被 Git 忽略，不提交生成的 SVG。
- 发布地址：<https://xaufe-ca.github.io/.github/>；两主题 SVG 由 GitHub Pages 托管。
- 展示位置：[`profile/README.md`](../profile/README.md)
- 图内文案统一使用中文，Commit、PR、Issue 术语与 README 保持一致；浅色与深色版本使用相同文案。

## 视觉样式

- 圆角、排版与浅色配色参考 Neoverse-UI 的 `packages/tokens/src/primitives.css`、
  `themes/light.css`、`geometry.css` 与
  `packages/tailwind/src/components/stat-card.css`；浅色天空蓝强调色为 `#74BAE5`。
- 深色以 Neoverse-UI 的中性色为主：将 `#050B14` / `#0C1829` 与横幅暗部色
  按 80% / 20% 混合，得到 `#050D1C` / `#0B182D` 背景；表面采用 50%
  不透明度的 `#132134`，文字使用 Neoverse-UI 的冷白与灰蓝，避免整卡高饱和蓝。
- 强调色使用 Neoverse-UI 的青蓝 `#38BDF8`，活动色阶融合横幅的钴蓝
  `#0E81FD` 与冰蓝 `#B5ECFE`。横幅取色基于 2172 × 724 原图，以左上角为原点：
  暗部采样区为 `(800, 0)–(1100, 40)` 与 `(1150, 60)–(1300, 120)`，
  钴蓝为 `(1340, 280)–(1370, 300)`，冰蓝为 `(1090, 235)–(1120, 255)`。
  各区域选择最接近 RGB 中位数的实际像素，避免将边缘抗锯齿或局部亮点作为基色。
- 外层采用 24px 面板圆角，四个指标卡采用 16px 卡片圆角。静态材质参考
  Neoverse-UI 的 `subtle` 表面：指标卡、活动区与徽标不绘制高光描边，
  只通过低对比度色块区分层次；外框保留均匀、低透明度的细边界。
- “公开活动快照”胶囊按圆点与六字文案收紧宽度，内容整体左右各留约 16px，
  右边缘与同步时间对齐；不通过放大字号或拉伸文字填满固定宽度。
- 环境渐变仅作为低强度背景配色，结合横幅蓝与 Neoverse-UI 的薄荷、淡紫，
  不模拟 Glass 折射。SVG 不加载外部字体、脚本或运行时着色器。
- 面板先合成不透明底板与装饰，再统一应用圆角蒙版；不要用逐图形裁剪
  代替合成后蒙版，否则抗锯齿叠加会造成四角透明度不一致。
- 保留 1024 × 342 画布、原有指标与 UTC 统计口径；逐日活动图例使用
  8 × 8 的 1:1 正方形色块，展示零活动和四档活动色阶。浅色为薄荷绿、
  深色为蓝色，与每日单元格使用同一色阶。
- 样式修改在下一次成功部署后更新线上浅色、深色卡片。本地预览使用下方的
  `--placeholder --dry-run`；不要手工修改或提交生成的 SVG。

## 数据来源与统计方法

数据通过 GitHub REST / Search API 获取，只涉及 **XAUFE-CA 的公开 GitHub 活动**：

| 指标 | 说明 |
| --- | --- |
| 公开仓库 | 组织当前公开可见的仓库数量（包括已归档仓库） |
| 近 28 天 Commit | GitHub Commit Search API 在过去 28 个 UTC 日历日检索到的提交数 |
| 近 28 天已合并 PR | 最近 28 天在公开仓库合并的 Pull Request 数 |
| 待处理 Issue | 公开仓库尚未关闭的 Issue 数，不含 Pull Request |
| 逐日活动 | 从最近至多 300 条可检索提交中，统计近 28 天每天的提交数；若提交超过 300 条，活动条只展示部分提交，不代表完整贡献日历 |

所有 Commit、PR、Issue 搜索都显式限定 `is:public`，不依赖令牌本身是否只能读取公开仓库。
Commit 与已合并 PR 使用相同的 UTC 起止日期闭区间，包含起始日与结束日的全天，
不包含下一 UTC 日及之后的活动。这些数字不等同于 GitHub 为个人账号计算的贡献数；
GitHub 搜索索引更新可能存在延迟。

## 更新机制

- [工作流](../.github/workflows/community-pulse.yml) 计划每 6 小时运行一次，并支持在 GitHub Actions 页面手动触发。
- 首次合并 / 推送工作流与生成器到默认分支后，也会启动更新。
- 使用仓库自带的 `GITHUB_TOKEN`，无需额外配置个人访问令牌（PAT）。构建任务使用
  `contents: read`；部署任务使用 `pages: write` 与 `id-token: write`，不授予 `contents: write`。
- Pages 使用 GitHub Actions 部署模式。工作流验证通过后获取真实公开数据，生成两主题 SVG，
  再组装 `index.html`；通过 Actions Pages artifact 仅上传 `_site/` 中这三个文件并部署，
  不提交生成物、不自动创建 Commit，也不将仓库其余内容上传到 Pages。
- [生成脚本](../scripts/update-community-pulse.mjs) 在成功取得所需 API 响应并完成两主题渲染后，
  将有变化的新内容与旧内容备份暂存到输出目录内的 `.community-pulse-*` 临时目录，
  再替换目标文件；内容未变化时不写入。替换失败时恢复此前文件或移除本轮新建文件；
  若恢复失败，保留旧内容备份并报告恢复目录，不得发布不完整产物。
  此机制不保证强杀进程或掉电时的跨文件原子性，异常终止后应检查输出与恢复目录。
- 测试、API 请求、数据验证、渲染或产物准备失败时不会进入部署，之前成功发布的站点保持不变。
  本地构建成功不等于已经发布；必须区分本地输出、Actions 构建产物与成功的 Pages 部署。
- 定时触发可能延迟，公开仓库连续 60 天没有活动时还可能自动停用，因此不承诺每 6 小时
  必定更新。维护者应按需重新启用工作流，并遵守既有分支保护及 Pages 环境的审批、部署限制，
  不得为刷新看板绕过保护。
- GitHub README 图片可能经 Camo 代理缓存；Pages 部署成功后，主页图片仍可能稍后才更新，
  不应把旧缓存直接判断为部署失败。

## 数据来源的已知限制

这些限制会直接影响如何解读看板上的数字，修改统计方法前请先评估：

| 限制 | 影响 |
| --- | --- |
| 公开仓库数量包含已归档仓库与 Fork（通过 `type=public` 参数获取组织的公开仓库列表） | “公开仓库”不等于活跃项目数 |
| Commit 统计依赖 GitHub Commit Search API 索引 | 索引更新可能延迟，多分支中的相同提交可能只计一次，因此统计值可能低于实际提交数 |
| 单次运行至多获取 300 条提交 | 提交较多时，每天的活动统计可能只包含部分提交，图内会显示相应提示 |
| Commit Search 与 Issue Search 受 Search API 请求次数限制 | 本地未设置令牌时，请求可能因超过次数限制而失败；工作流中使用 `GITHUB_TOKEN` |
| 已合并 PR 使用 `merged:<起始日>..<结束日>` 检索 | 起止日均按 UTC 日历日计入，索引更新时间仍可能带来少量偏差 |
| 未关闭 Issue 通过 Search API 计数 | 与仓库 Issue 列表页显示的数字可能在索引更新期间短暂不一致 |

## 本地验证

增删参数时，请更新本小节。

需要 Node.js 24 或更新版本；CI 验证 Node.js 24、26，正式刷新工作流使用 Node.js 24：

```sh
npm test                  # Run all generator unit tests. | 运行生成器的全部单元测试。
npm run pulse:placeholder  # Print a placeholder SVG without network access. | 输出占位 SVG，不访问网络。
npm run pulse:dry          # Fetch GitHub API data; print the light-theme SVG to stdout. | 从 GitHub API 获取数据，仅将浅色 SVG 输出到终端。
npm run pulse             # Fetch GitHub API data; write both SVG themes to ignored _site/. | 从 GitHub API 获取数据，将浅色和深色 SVG 写入被忽略的 _site/。
```

也可以直接调用脚本：`node scripts/update-community-pulse.mjs [--output-dir <path>] [--placeholder] [--dry-run [--theme light|dark]]`。

- `--dry-run` 只输出 SVG，不修改文件；`--theme` 仅在使用 `--dry-run` 时选择输出主题，正常更新会同时保存浅色和深色两个版本。
- `--output-dir <path>` 指定输出目录；默认 `_site/` 相对于当前工作目录解析，而不是脚本所在目录。
  正常刷新生成 `community-pulse.svg` 与 `community-pulse-dark.svg`；自定义输出目录也不得纳入版本控制。
- `--placeholder` 使用占位数据，不访问网络，但不禁止写文件；本地预览必须同时使用 `--dry-run`。
- 未认证的请求可能超过 Search API 的次数限制，可先设置 `GITHUB_TOKEN` 环境变量（只需读取公开数据，无需额外权限）。
- 单次请求及其响应体读取共用 20 秒超时；遇到 502/503/504、网络断流或超时，
  会等待 400 毫秒后重试一次，仍失败则报错。JSON 语法错误及 403/429 请求受限错误不重试。
- 未指定 `--placeholder` 和 `--dry-run` 时，脚本会访问 GitHub API 并更新本地输出目录中的 SVG；
  内容未变化时不会写文件。`npm run pulse` 只写入未跟踪的 `_site/`，不会提交或部署。
  发布前须核对图中真实数据、数据来源与统计方法，不得将占位预览作为正式 Pages 产物。
  本地输出仅供检查；线上更新以成功的 Pages 部署为准。
- 修改圆角或透明效果时，需在浏览器中将浅色、深色 SVG 绘制到透明 Canvas，
  以 1×、2× 分辨率比较四角 24px 区域的镜像对应像素 alpha，允许至多 1/255
  的舍入差异；角外应全透明，面板内部应不透明。此像素检查不由 Node 单元测试覆盖。

统计仅用于社区活动展示，**不作为个人贡献排名或成员绩效衡量**。

## 后续扩展

当 XCA-Portal、XCA-OJ 等仓库正式公开后，统计会自动包含这些仓库。未来可逐步增加各项目的 Issue、PR 数量变化和已公开成员的贡献展示；新增指标前应先写清数据来源和计算方法，确保他人能够按相同方法核对结果。
