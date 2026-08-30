# GitHub 部署状态

> **部署已完成** —— <https://github.com/zkf-cn/BiddingBox>

## 目标仓库

`https://github.com/zkf-cn/BiddingBox`（public，原为空仓库，描述"招标代理相关的各类费用计算工具"，即本项目。
未新建重复仓库，直接复用了这个已存在的空仓库。）

## 最终状态

| 步骤 | 状态 |
|------|------|
| 确认 GitHub 身份（账号 `zkf-cn`） | ✅ |
| 选定目标仓库 `zkf-cn/BiddingBox` | ✅ |
| 编写 `.gitignore`（排除 `node_modules/` `dist/` `.vite/` `.workbuddy/`） | ✅ |
| `git init -b main` + 首次提交 | ✅ `9e687fa`，42 文件 / 21179 行 |
| 关联远程 `origin`（URL 内不含令牌） | ✅ |
| `git push` | ✅ 已推送（远端 51 个文件） |
| 补推 `outputs/deployment.md` | ✅ `ff9fb03`（经 Contents API，原因见下） |

## 过程中的两个坑

### 1. fine-grained PAT 缺 Contents 权限 → push 403

```
remote: Permission to zkf-cn/BiddingBox.git denied to zkf-cn.
```

权限是**分项**的。探测结果：

| 操作 | 所需权限 | 结果 |
|------|---------|------|
| `GET /user`、列出仓库 | — | ✅ |
| 读仓库 / 列协作者 / 改描述 | Metadata + Administration | ✅ |
| **创建文件（= git push 走的权限）** | **Contents: write** | ❌ 403 |

**"能改仓库描述"不等于"能推代码"。** 解决办法：令牌设置 → Repository permissions → **Contents 改成 Read and write**。

### 2. 探测操作污染了远端历史，需强制推送

为了诊断权限，我用 Contents API 建了个探测文件再删掉，这在空仓库上生成了 2 条提交
（`40e3411 probe`、`371fca8 probe cleanup`），与本地首次提交构成无关历史，普通 push 会被拒。
远端内容 100% 是探测残留、无任何有价值数据，因此用 `git push -f` 覆盖，
远端恢复为干净的单提交 `9e687fa`。

### 3. 沙箱内 git 无法连接 github.com:443

首次强制推送成功后，`git` 再访问 `github.com:443` 持续超时（21s），
而 node 访问 `api.github.com` 正常（无代理差异，`http.proxy` 未配置）。
因此最后一份文档改用 **GitHub Contents API** 提交。
副作用：本地 `main` 与远端短暂分叉，已把本地回退到共同祖先，网络恢复后 `git pull` 可快进。

## 本地仓库当前状态

- 本地 `main` = `9e687fa`；远端 `main` = `ff9fb03`（`9e687fa` 的后代）
- `outputs/deployment.md` 本地为未跟踪状态，远端已包含
- 网络恢复后执行 `git pull` 即可完全同步（可快进，不会冲突）

## 后续可选项

- **GitHub Pages 上线**：本应用是纯静态 Vite 站点，仓库又是 public，可开 Pages。
  需先在 `react-vite/vite.config.js` 加 `base: './'`（当前资源用绝对路径 `/assets/...`，
  在 `https://zkf-cn.github.io/BiddingBox/` 这类子路径下会 404），再配 Actions 工作流自动 build + 部署。
- **代码分割**：产物 558KB（gzip 169KB）超过 Vite 默认告警线，可按需做 `manualChunks`。

## 安全提醒

这个 PAT 曾以明文形式贴在对话中，且具备账号级读权限与仓库写权限。
**建议到令牌设置页 Revoke（撤销）**，后续改用 SSH key 或 git credential manager。
已确认本地 `.git/config` 未残留令牌。
