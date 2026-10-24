# XCA · 项目开发与协作规范

![版本 v0.1.0][badge-version] ![状态：试行][badge-trial]

> [!NOTE]
> **适用范围**：XCA 社区官方维护的项目及其贡献者。当前版本为 **v0.1.0（试行）**。
>
> 相关文档：[贡献指南](https://github.com/XAUFE-CA/.github/blob/main/CONTRIBUTING.md) · [社区行为准则](https://github.com/XAUFE-CA/.github/blob/main/CODE_OF_CONDUCT.md) · [安全说明](https://github.com/XAUFE-CA/.github/blob/main/SECURITY.md) · [AI Agent 补充约定](https://github.com/XAUFE-CA/.github/blob/main/AGENTS.md)

## 快速导航

- **AI 规范**：[AI Agent 开发](#1-ai-agent-开发规范) · [AI 辅助协作](#2-ai-辅助协作规范)
- **开发流程**：[Git 提交](#3-git-提交规范) · [Commit Message](#4-git-commit-message-规范) · [代码审查与合并](#5-代码审查与合并规范)
- **社区协作**：[Issue / PR](#6-issue-与-pull-request-协作规范) · [规范执行](#7-规范执行与例外)

## 前言

XCA 鼓励开放、平等、透明且负责任的技术协作，支持贡献者使用传统开发工具与人工智能辅助工具参与项目开发。

本规范旨在明确开发行为、责任归属与协作流程，保障项目的安全性、可靠性及可维护性，同时避免不必要的流程负担。

### 规范性关键词

本规范采用以下约束等级：

| 规范标识 | 含义 | 约束等级 |
| :--- | :--- | :--- |
| ![MUST][badge-must] | 必须遵守 | **强制** |
| ![MUST NOT][badge-must-not] | 严格禁止 | **强制** |
| ![SHOULD][badge-should] | 应当遵守，允许有充分理由的例外 | **推荐** |
| ![SHOULD NOT][badge-should-not] | 原则上应当避免 | **推荐** |
| ![MAY][badge-may] | 可以自行选择 | **可选** |

各项规范均按 **强制 → 推荐 → 可选** 的顺序排列条款。

未标注规范性关键词的说明性内容不单独构成强制要求。

---

## 1. AI Agent 开发规范

> **概要：** 本部分规定 AI Agent 执行开发任务时的附加要求。使用 Agent 时，必须同时遵守 [AI 辅助协作规范](#2-ai-辅助协作规范)。

### 1.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] AI Agent 执行的任务必须有明确的人类负责人。
2. ![MUST][badge-must] Agent 必须在明确授权的任务及权限范围内操作，不得擅自扩大工作范围。
3. ![MUST NOT][badge-must-not] 未经授权，Agent 不得删除重要数据、修改生产环境或执行其他高风险操作；涉及 Git 操作时，还须遵守 [Git 提交规范](#3-git-提交规范)。
4. ![MUST NOT][badge-must-not] Agent 不得绕过项目规定的安全检查；分支保护与合并审批要求统一见 [代码审查与合并规范](#5-代码审查与合并规范)。

### 1.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] Agent 在修改代码前应当了解项目架构、现有实现及相关开发规范；在缺乏必要项目上下文时，不应实施大规模重构。
2. ![SHOULD][badge-should] 应当优先采用范围明确、可验证、可回退的增量修改方式。
3. ![SHOULD][badge-should] Agent 完成任务后应当总结实际修改内容、验证结果及已知风险。

### 1.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 在明确授权的情况下，Agent 可以创建 Git 提交、推送分支及创建 Pull Request（拉取请求，简称 PR）。
2. ![MAY][badge-may] 贡献者可以通过项目级 `AGENTS.md` 补充 Agent 的行为约束。
3. ![MAY][badge-may] 项目可以使用自动化工具限制 Agent 的命令权限、文件访问范围和执行环境。

---

## 2. AI 辅助协作规范

> **概要：** 本部分适用于所有 AI 辅助开发与协作场景，包括使用 AI Agent。统一规定人类责任、产出审查、验证与信息保护，以及 AI 参与的披露要求。
>
> 通用的证据真实性要求见 [Issue 与 Pull Request 协作规范](#6-issue-与-pull-request-协作规范)。

### 2.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] 贡献者必须对 AI 辅助产生的最终提交内容及授权操作负责，并能够解释其核心逻辑和预期行为，不得以使用 AI 为由免除个人责任。
2. ![MUST][badge-must] 提交者必须检查 AI 生成的实际代码差异，理解关键实现及其潜在影响，检查通过后方可纳入正式贡献。
3. ![MUST][badge-must] 使用 AI 产生的内容必须遵守适用的版权、许可证和项目安全要求。
4. ![MUST][badge-must] 当 AI 实质性参与主要功能实现、大规模重构或自主执行多文件变更时，必须在 PR 中说明其参与范围与人工验证情况。
5. ![MUST][badge-must] 必须完成项目规定的适用检查，并如实报告测试及验证结果。
6. ![MUST NOT][badge-must-not] 不得访问、传播或提交未经授权的凭据、私钥及其他敏感信息。
7. ![MUST NOT][badge-must-not] 不得将未经验证的 AI 推测描述为已确认的事实。

### 2.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 应当理解 AI 所提出技术方案的依据，结合项目需求判断其适用性，并检查变更是否引入不必要的依赖、冗余代码、兼容性问题或无关修改。
2. ![SHOULD][badge-should] 对重要技术结论，应当通过实际代码、测试或可靠技术资料进行验证。
3. ![SHOULD][badge-should] 涉及安全、权限、数据处理、系统架构等关键部分时，应当进行更严格的人工审查。
4. ![SHOULD][badge-should] 应当将 AI 用于辅助学习、探索与提高效率，不应以 AI 输出替代必要的技术判断。

### 2.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 贡献者可以自行选择 AI 工具、模型及协作方式。
2. ![MAY][badge-may] 普通代码补全、语法提示及拼写修正等轻量辅助可以不予披露。
3. ![MAY][badge-may] 贡献者可以自愿补充 AI 协作记录，但无须公开完整提示词或私人对话。

---

## 3. Git 提交规范

> **概要：** 本部分规定变更组织、分支管理与提交前检查。合并条件统一见 [代码审查与合并规范](#5-代码审查与合并规范)。

### 3.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] 贡献者必须遵守目标仓库已公布的分支管理与提交要求。
2. ![MUST][badge-must] 提交前必须检查暂存内容，避免提交敏感信息及明显无关的文件。
3. ![MUST][badge-must] 用于正式合并的提交信息必须符合 [Git Commit Message（Git 提交信息）规范](#4-git-commit-message-规范) 的规定。
4. ![MUST NOT][badge-must-not] 未经授权，不得强制推送或重写共享分支历史。
5. ![MUST NOT][badge-must-not] 不得提交密钥、凭据、个人隐私数据或其他不应纳入版本控制的敏感内容。

### 3.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 功能开发、Bug（程序缺陷）修复及重构应当在独立工作分支中进行。
2. ![SHOULD][badge-should] 每次提交应当围绕一个明确目标，将无关功能、代码重构与格式化修改拆分为独立提交。
3. ![SHOULD][badge-should] 推荐使用以下分支命名约定：
   - `feat/<name>`
   - `fix/<name>`
   - `docs/<name>`
   - `refactor/<name>`
4. ![SHOULD][badge-should] 提交前应当检查工作区是否还有与本次目标相关、但未纳入暂存区的改动。

推荐命令：

```bash
git status
git diff
git diff --cached
```

### 3.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 贡献者可以使用命令行、IDE（集成开发环境）或图形化 Git 客户端。
2. ![MAY][badge-may] 项目可以根据实际规模设置 `dev` 集成分支，或直接使用 `main` 作为主要开发分支。
3. ![MAY][badge-may] 可以使用 Git Hooks（Git 钩子）、Lint-staged 等工具自动完成提交前检查。

---

## 4. Git Commit Message 规范

> **概要：** 所有正式合并的提交信息必须遵循 Conventional Commits（约定式提交）规范，准确、简洁地描述变更内容，并明确标识破坏性变更。

### 4.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] 用于正式合并的提交信息必须遵循 Conventional Commits 格式。

   ```text
   <type>(<scope>): <description>

   [optional body]

   [optional footer]
   ```

   其中，`type`（类型）表示提交类型，`scope`（影响范围）表示变更涉及的模块或功能，`description`（简短描述）概括变更内容，`body`（正文）补充详细说明，`footer`（尾部信息）用于关联 Issue（议题）或声明破坏性变更；`optional`（可选）表示对应部分可以省略。

2. ![MUST][badge-must] 必须选择符合实际变更性质的提交类型。

   | 类型 | 说明 |
   | --- | --- |
   | `feat` | 新增功能 |
   | `fix` | 修复问题 |
   | `docs` | 文档更新 |
   | `refactor` | 代码重构 |
   | `perf` | 性能优化 |
   | `test` | 测试相关 |
   | `style` | 不影响逻辑的格式修改 |
   | `build` | 构建系统或依赖修改 |
   | `ci` | CI（持续集成）/CD（持续交付或持续部署）配置 |
   | `chore` | 其他维护工作 |
   | `revert` | 回退提交 |

3. ![MUST][badge-must] 描述必须准确反映实际变更内容，不得使用虚假、误导性或无法识别变更目的的表述。
4. ![MUST][badge-must] 破坏性变更必须使用 `!` 或 `BREAKING CHANGE` 标记，并明确说明兼容性影响。

### 4.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 提交信息使用中文还是英文应当遵循项目规范。
2. ![SHOULD][badge-should] 描述应当突出变更目的，而非开发过程。
3. ![SHOULD][badge-should] 复杂变更应当在正文中补充修改原因、实现方式及潜在影响。
4. ![SHOULD][badge-should] 描述应当简洁、具体，避免重复信息。
5. ![SHOULD NOT][badge-should-not] 不应使用 `update`、`fix bug`、`final version` 等含糊描述。

英文示例：

```text
feat(auth): add CAS authentication support
fix(terminal): prevent unexpected overflow
refactor(ui): extract shared glass tokens
docs: update contribution guidelines
test(api): cover invalid request payloads
```

对应的中文示例：

```text
feat(auth): 添加 CAS 认证支持
fix(terminal): 修复意外溢出问题
refactor(ui): 提取共用的玻璃质感样式变量
docs: 更新贡献指南
test(api): 覆盖无效请求数据的情况
```

### 4.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 可以省略 `scope`。
2. ![MAY][badge-may] 简单变更可以不编写正文。
3. ![MAY][badge-may] 可以在提交信息的尾部关联 Issue 或补充其他元数据。

英文示例：

```text
fix(auth): prevent duplicate session creation

Avoid creating multiple sessions when concurrent
authentication requests arrive.

Add regression tests for concurrent login attempts.

Closes #42
```

对应的中文示例：

```text
fix(auth): 防止重复创建会话

避免并发认证请求到达时创建多个会话。

为并发登录场景添加回归测试。

Closes #42
```

---

## 5. 代码审查与合并规范

> **概要：** 本部分集中规定代码审查与合并条件。PR 内容与验证证据的要求见 [Issue 与 Pull Request 协作规范](#6-issue-与-pull-request-协作规范)。

### 5.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] 合并操作必须遵守目标仓库已公布的合并规则，满足必需的 CI、测试和审查条件，以及受保护分支的审批与状态检查要求。
2. ![MUST][badge-must] 合并后的代码必须符合项目明确规定的安全性、兼容性及质量要求。
3. ![MUST][badge-must] 采用紧急合并时，必须符合 [紧急合并的适用情形](#54-紧急合并的适用情形)，获得规定的授权，并保留必要的验证与事后记录。
4. ![MUST NOT][badge-must-not] 不得未经授权绕过分支保护或合并审批。
5. ![MUST NOT][badge-must-not] 不得隐瞒已知的重大安全问题。
6. ![MUST NOT][badge-must-not] 不得为使 CI 通过而无正当理由地删除、禁用或绕过失败的测试。

### 5.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 官方项目应当以 Pull Request 作为主要代码合并渠道。
2. ![SHOULD][badge-should] 推荐至少由一名非作者的审查者进行独立审查。
3. ![SHOULD][badge-should] 推荐使用 Squash and Merge（压缩合并），保持主要提交历史清晰。
4. ![SHOULD][badge-should] PR 作者应当主动处理合并冲突，并重新验证受影响的代码。
5. ![SHOULD][badge-should] 合并前应当解决代码审查中提出的实质性意见。
6. ![SHOULD NOT][badge-should-not] 不应在不了解冲突内容的情况下直接接受某一侧的全部变更。

### 5.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 项目可以根据技术需求采用 Merge Commit（合并提交）或 Rebase and Merge（变基合并）。
2. ![MAY][badge-may] 单维护者项目可以制定符合其规模的审查例外规则，但不得绕过既有的强制保护。
3. ![MAY][badge-may] 项目可以优先安排符合 [紧急合并适用情形](#54-紧急合并的适用情形) 的修复或回退变更，具体执行仍须符合强制性要求。

### 5.4 紧急合并的适用情形

紧急合并是指：为制止或避免正在发生、或有明确证据表明即将发生的严重损害，需要优先合并直接用于修复或回退的变更；若等待常规合并安排，损害将持续或明显扩大。典型情形包括：

- **严重安全风险**：漏洞已被利用或存在迫近的利用风险，可能导致未授权访问、敏感信息泄露或系统被控制。
- **关键服务故障**：线上关键服务中断、核心功能大面积不可用，或已发布版本的严重回归导致用户无法正常安装、启动或使用核心功能。
- **数据完整性风险**：缺陷正在造成或即将造成严重的数据丢失、损坏或错误写入，需要立即止损。

普通功能开发、样式与文档调整、一般性 Bug 修复，以及仅为赶发布时间、满足个人排期或因审查者暂时不在线而希望提前合并的情况，**不属于紧急合并**。仅标注“紧急”或“高优先级”，不足以构成紧急合并的依据。

是否属于紧急情形，应根据实际影响、发生的可能性与迫近程度，以及等待常规合并的后果判断；变更必须直接用于处置该风险，不得夹带无关功能或重构。授权、验证与记录要求仍按 5.1 执行，紧急性不豁免必需的检查、审批或分支保护要求。

---

## 6. Issue 与 Pull Request 协作规范

> **概要：** 本部分规定 Issue 与 PR 的沟通、描述、关联及证据真实性要求。合并条件统一见 [代码审查与合并规范](#5-代码审查与合并规范)。

### 6.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] PR 描述必须真实反映修改范围、验证情况及已知的重要风险。
2. ![MUST][badge-must] 实质性 AI 参与必须按照 [AI 辅助协作规范](#2-ai-辅助协作规范) 中的强制性要求进行披露。
3. ![MUST][badge-must] 审查与讨论过程中必须遵守 [社区行为准则](https://github.com/XAUFE-CA/.github/blob/main/CODE_OF_CONDUCT.md)。
4. ![MUST NOT][badge-must-not] 不得在公开 Issue、PR 或评论中披露凭据、私人敏感信息及尚未修复的可利用漏洞细节；漏洞报告方式见 [安全说明](https://github.com/XAUFE-CA/.github/blob/main/SECURITY.md)。
5. ![MUST NOT][badge-must-not] 不得伪造人工审查、测试结果、审查记录、其他验证证据或贡献来源。

### 6.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 创建 Issue 前应当搜索现有问题，避免重复。
2. ![SHOULD][badge-should] Bug 报告应当包含复现步骤、预期行为、实际行为和必要的环境信息。
3. ![SHOULD][badge-should] 功能提案应当说明背景、目标、建议方案及验收条件。
4. ![SHOULD][badge-should] PR 应当使用项目提供的模板；存在相关 Issue 时，应当建立关联。
5. ![SHOULD][badge-should] 大规模功能变更或架构调整应当在开发前与维护者讨论。
6. ![SHOULD][badge-should] 审查者应当提出具体、可执行的审查意见。
7. ![SHOULD][badge-should] PR 作者应当认真回应实质性审查意见。
8. ![SHOULD NOT][badge-should-not] 不应在缺乏必要说明的情况下提交大规模或难以审查的 PR。

### 6.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 简单文档修改、小型 Bug 修复可以直接提交 PR，无须预先创建 Issue。
2. ![MAY][badge-may] 开放性的技术讨论可以使用 GitHub Discussions。
3. ![MAY][badge-may] 贡献者可以通过 Draft PR（草稿拉取请求）提前展示未完成的工作并征求反馈。
4. ![MAY][badge-may] 项目可以配置 Issue Forms（议题表单）、PR Templates（拉取请求模板）、Labels（标签）等工具改善协作效率。

---

## 7. 规范执行与例外

> **概要：** XCA 各项目必须遵守统一的安全与责任要求，同时允许根据项目规模和技术特点制定补充规则，并公开说明合理例外。

### 7.1 强制性要求 ![MUST][badge-must] ![MUST NOT][badge-must-not]

1. ![MUST][badge-must] 所有适用的 XCA 官方项目及其贡献者必须遵守本规范的强制性要求。
2. ![MUST][badge-must] 项目级规则必须与本规范的安全、责任和真实性要求保持一致。
3. ![MUST][badge-must] 规范的实质性修改必须经过社区认可的管理或审查流程。
4. ![MUST NOT][badge-must-not] 任何贡献者不得利用 AI 工具或自动化流程规避本规范的强制要求。

### 7.2 推荐性要求 ![SHOULD][badge-should] ![SHOULD NOT][badge-should-not]

1. ![SHOULD][badge-should] 对推荐性要求的例外，应当根据影响范围说明原因。
2. ![SHOULD][badge-should] 项目维护者应当优先通过自动化检查落实客观、可验证的规则，可选用 CI、Git Hooks、GitHub Rulesets 等机制。
3. ![SHOULD][badge-should] 社区应当定期评估本规范的适用性，避免不必要的流程负担。

### 7.3 可选性要求 ![MAY][badge-may]

1. ![MAY][badge-may] 各项目可以根据技术栈、维护规模及开发阶段制定补充规范。
2. ![MAY][badge-may] 社区可以通过 Issue、Discussions 或 PR 收集规范改进意见。

---

[badge-must]: https://img.shields.io/badge/MUST-b5475b?style=flat
[badge-must-not]: https://img.shields.io/badge/MUST%20NOT-b5475b?style=flat
[badge-should]: https://img.shields.io/badge/SHOULD-4f7863?style=flat
[badge-should-not]: https://img.shields.io/badge/SHOULD%20NOT-4f7863?style=flat
[badge-may]: https://img.shields.io/badge/MAY-526d82?style=flat
[badge-version]: https://img.shields.io/badge/version-v0.1.0-38bdf8?style=flat&labelColor=0f172a&logoColor=f4f8fc
[badge-trial]: https://img.shields.io/badge/status-trial-536a7b?style=flat&labelColor=0f172a&logoColor=f4f8fc
