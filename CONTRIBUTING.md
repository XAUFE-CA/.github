# 参与贡献

> [!NOTE]
> **适用范围**：本指南面向第一次向 XCA 项目贡献内容的同学，介绍没有原仓库写入权限时，如何通过 Fork 和 Pull Request 提交修改。具体项目另有操作说明时，请以对应仓库为准。
>
> 协作要求统一见 [XCA 项目开发与协作规范](https://github.com/XAUFE-CA/.github/blob/main/COLLABORATION.md)，包括 AI 使用与披露；社区交流约定见 [社区行为准则](https://github.com/XAUFE-CA/.github/blob/main/CODE_OF_CONDUCT.md)。AI Agent 在本仓库工作时还需遵守 [`AGENTS.md`](https://github.com/XAUFE-CA/.github/blob/main/AGENTS.md)。

不需要先成为组织成员，也不需要原仓库的写入权限。你可以先在自己的仓库副本中修改，再向原项目提出合并请求。修正一处文档、补充一个使用示例，都可以是第一次贡献。

如果只是报告问题或提出建议，不必先 Fork：在目标仓库的 **Issues → New issue** 选择对应模板即可；本仓库提供 [Issue 入口](https://github.com/XAUFE-CA/.github/issues/new/choose)，包含 **Bug Report / 问题报告** 与 **Feature Request / 功能提案**。

安全漏洞不要通过普通 Issue 公开报告。若仓库显示 **Report a security vulnerability**，可从该原生入口查看安全说明；报告渠道以对应项目的安全说明为准，通用约定见 [安全说明](https://github.com/XAUFE-CA/.github/blob/main/SECURITY.md)。

下面以修改 `README.md` 为例，使用 GitHub 网页和 Git 命令行完成一次贡献。

## 1. 准备账号与工具

1. 注册并登录 [GitHub](https://github.com)。
2. 安装 [Git](https://git-scm.com/downloads)。Windows 用户可以打开安装后提供的 Git Bash；macOS、Linux 用户可以使用终端。
3. 在 [项目列表](https://github.com/orgs/XAUFE-CA/repositories) 中选择目标仓库，先阅读它的 README、开发说明和许可证。
4. 第一次使用 Git 时，在终端设置提交者姓名和邮箱：

```sh
git config --global user.name "YOUR_NAME"
git config --global user.email "YOUR_COMMIT_EMAIL"
```

将 `YOUR_NAME` 替换为你希望显示的提交者姓名，不必与 GitHub 用户名相同；将 `YOUR_COMMIT_EMAIL` 替换为关联 GitHub 账号的邮箱。不想公开个人邮箱时，可以使用 [GitHub 邮箱设置](https://github.com/settings/emails) 中提供的 `noreply` 地址。这些信息用于标记提交者，不是登录凭据。

后续命令中的 `YOUR_USERNAME` 表示你的 GitHub 用户名，`REPO` 表示仓库名称，运行前都要替换为实际值。示例使用 `main` 作为目标分支；如果项目要求向其他分支提交，请一并替换命令和 PR 页面中的分支选择。

## 2. Fork：在自己账号下创建副本

1. 打开准备参与的原仓库，例如 `XAUFE-CA/REPO`。
2. 点击右上角的 **Fork**。
3. 将 **Owner** 选为自己的账号，通常保留原仓库名称；只参与默认分支开发时，保留仅复制默认分支的选项即可。
4. 点击 **Create fork**。完成后，你会进入 `YOUR_USERNAME/REPO`，这就是你的 Fork。

Fork 是 GitHub 上属于你的仓库副本，不是下载到电脑的文件夹。如果之前已经 Fork 过，不用重复创建；可以在自己的 Fork 页面点击 **Sync fork → Update branch** 同步原仓库的更新。若页面提示冲突，不要直接覆盖已有修改，可以先向维护者询问如何处理。

## 3. Clone：把自己的 Fork 下载到电脑

在**自己的 Fork 页面**点击 **Code → HTTPS**，复制仓库地址。在终端进入你准备存放项目的目录，再运行：

```sh
git clone https://github.com/YOUR_USERNAME/REPO.git
cd REPO
```

如果 Fork 时改了仓库名称，请使用 **Code** 按钮实际提供的地址，并进入克隆后生成的目录。

接着添加原仓库的地址，方便后续获取更新：

```sh
git remote add upstream https://github.com/XAUFE-CA/REPO.git
git remote -v
```

检查输出中的地址：

| 名称 | 应指向哪里 | 用途 |
| :--- | :--- | :--- |
| `origin` | `YOUR_USERNAME/REPO` | 将你的修改推送到自己的 Fork |
| `upstream` | `XAUFE-CA/REPO` | 获取原仓库的更新 |

**后面的 `push` 应发送到 `origin`，而不是 `upstream`。** 如果 `origin` 指向组织仓库，通常是克隆错了地址；先纠正远程地址，再继续操作。

## 4. 为这次修改创建分支

先获取原仓库的最新内容，再从目标分支创建自己的工作分支：

```sh
git fetch upstream
git switch -c docs/improve-readme upstream/main
```

`docs/improve-readme` 是这次修改的分支名。命令执行后，你已经切换到这个分支，可以开始修改。下一次贡献请换一个新的分支名，不要继续往已经提交过 PR 的分支里混入其他任务。

## 5. 修改文件并验证

用编辑器打开项目目录，修改 `README.md` 并保存。然后查看本地改动：

```sh
git status
git diff
```

`git status` 会列出修改、新增等文件状态；`git diff` 显示尚未暂存的已跟踪文件改动。新增文件的内容会在下一步暂存后显示出来。

按照目标项目的开发说明运行相应检查。文档改动也应预览排版、检查链接；代码改动则需要运行项目要求的测试。

如果修改的是本仓库，Community Pulse 的环境要求和验证命令集中维护在 [本地验证](https://github.com/XAUFE-CA/.github/blob/main/docs/community-pulse.md#本地验证)。不要将其中的命令不加区分地用于其他项目。

## 6. Commit：把修改保存为本地提交

先将本次准备提交的文件加入暂存区，再检查即将提交的内容：

```sh
git add README.md
git diff --cached
```

暂存区表示“准备放进下一次提交的修改”。如果改的是其他文件，请把 `README.md` 换成实际路径；修改多个文件时，可以在 `git add` 后逐个列出路径。确认这里没有误加的文件或敏感信息，再创建提交：

```sh
git commit -m "docs: 完善 README 说明"
```

这条命令只把修改保存到本地，还没有上传到 GitHub。上面的提交信息是操作示例；实际格式和使用中文还是英文，请遵循目标项目要求，详见 [Git Commit Message 规范](https://github.com/XAUFE-CA/.github/blob/main/COLLABORATION.md#4-git-commit-message-规范)。

## 7. Push：把分支上传到自己的 Fork

```sh
git push -u origin docs/improve-readme
```

`-u` 会记录这个分支与远程分支的对应关系。推送成功后，在 GitHub 打开自己的 Fork，切换到 `docs/improve-readme`，确认能看到刚才的提交和文件修改。

如果 HTTPS 推送要求登录，请按 Git 凭据管理器的提示完成身份验证，不要把 GitHub 账号密码当作 Git 的 HTTPS 密码。其他认证方式可查阅 [GitHub 身份验证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)。如果提示没有写入权限，先用 `git remote -v` 检查 `origin` 是否指向自己的 Fork。

## 8. 创建 Pull Request

Pull Request（简称 PR）是把你的分支修改合并到原项目的请求；推送分支本身并不会自动创建 PR。

1. 打开**原仓库**的 **Pull requests** 页面，点击 **New pull request**。
2. 点击 **compare across forks**，选择自己的 Fork 和工作分支。如果页面已有 **Compare & pull request** 提示，也可以从那里进入。
3. 核对合并方向：

| 页面选项 | 本例应选择 |
| :--- | :--- |
| **base repository** | 原仓库 `XAUFE-CA/REPO` |
| **base** | 原仓库的目标分支 `main` |
| **head repository / head fork** | 你的 Fork `YOUR_USERNAME/REPO` |
| **compare** | 你的工作分支 `docs/improve-readme` |

4. 查看页面下方的提交与文件差异，确认只包含这次准备贡献的修改。如果看不到改动，先检查是否选错了仓库或分支，以及本地提交是否已经推送。
5. 点击 **Create pull request**，填写标题和页面提供的模板。没有模板时，可以参考 [组织默认 PR 模板](https://github.com/XAUFE-CA/.github/blob/main/.github/pull_request_template.md)，写明改动内容、关联 Issue、实际验证结果、已知风险及适用的 AI 参与披露。
6. 再次点击 **Create pull request** 提交。还没完成、只是想先征求反馈时，可以在按钮旁的下拉菜单选择 **Create draft pull request**。

成功后会出现一个带编号的 PR 页面。到这一步，你的贡献已经提交给原项目，接下来等待检查和维护者反馈，而不是继续尝试直接推送到原仓库。

验证说明只针对本次改动：列出实际执行的检查，未验证部分如实说明；项目专项验证方法查阅对应维护文档。提交信息遵循 [Commit Message 规范](https://github.com/XAUFE-CA/.github/blob/main/COLLABORATION.md#4-git-commit-message-规范)。

## 9. 根据反馈更新同一个 PR

在 PR 页面的 **Conversation** 查看讨论，在 **Files changed** 查看逐行审查意见；自动检查未通过时，可以打开 **Checks** 或检查项的 **Details** 查看原因。首次贡献的工作流有时需要维护者批准后才能运行，等待批准不等于你的修改有错误。

需要调整时，在本地切换回这个 PR 对应的分支，修改文件并重新验证：

```sh
git switch docs/improve-readme
```

然后按照第 6 步检查并暂存本次修改，创建新的提交，再推送到**同一个分支**：

```sh
git commit -m "docs: 根据审查意见调整说明"
git push origin docs/improve-readme
```

GitHub 会把这些提交自动加入原 PR，通常不需要另开一个 PR。你可以在讨论中说明已调整的内容，方便审查者继续检查。

合并由维护者按项目流程处理；PR 创建成功不代表已经合并。合并后，再次贡献前先同步 Fork，并从更新后的原仓库目标分支创建新的工作分支。

更多页面操作说明可参考 GitHub 官方的 [项目贡献教程](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project) 和 [从 Fork 创建 Pull Request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)。
