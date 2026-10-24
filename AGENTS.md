# AGENTS.md

> [!NOTE]
> **适用范围**：面向在本仓库工作的 AI Agent（以及使用 AI 辅助的贡献者），仅适用于本仓库（XAUFE-CA/.github 组织默认仓库），不代替各项目仓库的规则。

## 仓库范围

- 本仓库只维护组织级公共资源：组织主页 `profile/README.md`、社区健康文件、
  Community Pulse 生成器与工作流，以及组织级协作规范。
- 不在此仓库实现具体产品功能；具体项目的开发、测试与发布要求以对应仓库说明为准。
- 根目录的 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`
  会作为组织默认社区健康文件，可能作用于其他公开仓库，措辞改动须谨慎。

## 必须遵守

- 必须阅读并遵守 [COLLABORATION.md](./COLLABORATION.md) 第 1 点（AI Agent 开发规范）
  与第 2 点（AI 辅助协作规范）；提交与合并要求见其第 3–5 点，不在本文件另设例外。
- 提交信息遵循 Conventional Commits（见 COLLABORATION.md 第 4 点）。
  面向 main 的改动优先通过分支与 Pull Request 完成，并如实填写 PR 模板；
  这不代表 Agent 自动获得创建提交、切换分支或推送的授权。
- 任务被限定范围时，只修改授权文件；保留用户已有的未提交、未跟踪及暂存改动，
  不擅自覆盖、回退或顺手整理。发现与任务描述冲突的现状时，先报告冲突，再决定相关修改。
- 交付时说明实际修改、已执行的检查、未执行的检查及原因，并区分本地修改与已发布结果。
  不得将 Agent 的自动检查描述为已完成人工审查；实质性 AI 参与仍须按协作规范在 PR 中披露。
- 解释性注释采用中英双语：独立注释块英文在上、中文在下；行内注释写作 `English | 中文`。
  用词须准确、自然；shebang、版本号、SHA 及机器可读指令不作重复翻译。
  此要求针对解释性注释，不要求文档正文或界面文案重复中英两遍。
  注释应说明不直观的设计原因、约束或维护要点，避免复述代码或逐项解释参数。

## 禁止事项

- 不得将凭据、私钥、Token 或未经授权的个人隐私数据写入仓库（包括 `.env`）、
  日志或交付内容；检查失败时也不得直接回显含敏感信息的输出。
- 未经任务明确授权，不得改动 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、
  `SECURITY.md`、`profile/README.md` 的措辞与承诺性表述。
- 不得未经讨论引入第三方运行时依赖、启用其他包管理器的工作流或更换包管理器配置。
- 不得伪造测试、审查或验证证据；不得为使 CI 变绿而删除、禁用或绕过失败的测试。
- 未经任务明确授权，不得提交、推送、打标签、切换分支、改写历史或丢弃工作区改动，
  也不得改动用户的暂存区或删除未跟踪文件。对某一操作的授权不自动扩展到其他操作。

## Community Pulse 快照

- `profile/assets/community-pulse.svg` 与 `profile/assets/community-pulse-dark.svg`
  只能由 `scripts/update-community-pulse.mjs` 的正式刷新流程生成；
  不得手工修改，也不得用占位或伪造数据覆盖真实快照。
- 默认采用离线预览：`npm run pulse:placeholder`，或显式使用
  `--placeholder --dry-run`。单独使用 `--placeholder` 仍会写入文件，不得用于本地预览。
- `--dry-run` 只保证不写文件，不保证离线；`npm run pulse:dry` 仍会访问 GitHub API。
  只有任务需要获取真实数据时才运行联网预览；仅需检查样式或参数时使用离线预览。
- 任务明确要求更新实际 SVG 资源时，才执行联网的 `npm run pulse`；
  仅修改生成器或进行预览不视为写入快照的授权。正式刷新会同时更新浅色、深色快照，
  不代表已提交或推送；在 PR 中（尚无 PR 时在交付说明中）记录刷新时间、数据来源和统计方法。
- 预览与测试前后直接比较两个快照的内容或哈希，确认文件未被改写；
  不得仅凭 `git status --short` 判断，已有脏文件或未跟踪文件被改写时，其状态可能不变。
- 修改卡片样式时，检查浅色、深色的实际渲染，包括文字边界、图例比例、对比度与圆角透明度，
  具体方法见维护说明。若已获授权刷新资源，还须检查刷新后的实际文件，不能只验证占位预览。
  未刷新或刷新失败时，明确说明实际快照仍未更新，不得将生成器修复等同于展示资源已更新。

## 验证命令

生成器无第三方运行时依赖，需要 Node.js 24+。完整命令与参数以
[docs/community-pulse.md 的本地验证说明](./docs/community-pulse.md#本地验证)为准。
按改动范围选择检查，不将生成器测试视为文档或工作流验证的替代：

```sh
npm test                        # Test the generator. | 运行生成器单元测试。
npm run pulse:placeholder        # Preview light SVG offline. | 离线预览浅色 SVG。
node scripts/update-community-pulse.mjs --placeholder --dry-run --theme dark # Preview dark SVG offline. | 离线预览深色 SVG。
```

- 只修改 Markdown 时，检查文档渲染、相对链接、锚点与规范引用，不因此刷新快照。
  CI 的链接检查由 `.github/workflows/links.yml` 执行。
- 修改工作流或 YAML 模板时，检查 YAML 语法及其对应平台规则；普通 YAML 解析不能替代
  GitHub Actions 或 Issue Forms 校验。修改工作流时，CI 还会通过
  `.github/workflows/actionlint.yml` 运行 actionlint。
- 本地运行 actionlint、lychee 或 YAML 解析器需要环境已提供相应工具或依赖；
  它们不是生成器的运行时依赖。工具缺失时如实报告未执行的检查，不为此擅自更换包管理器配置。
