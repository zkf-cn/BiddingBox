# GitHub 部署状态

## 目标仓库

`https://github.com/zkf-cn/BiddingBox`（public，原为空仓库，描述"招标代理相关的各类费用计算工具"，即本项目）

## 当前进度

| 步骤 | 状态 |
|------|------|
| 确认 GitHub 身份（账号 `zkf-cn`） | ✅ |
| 选定目标仓库（复用已存在的空仓库 `BiddingBox`，未新建重复仓库） | ✅ |
| 编写 `.gitignore`（排除 `node_modules/` `dist/` `.vite/` `.workbuddy/` 等） | ✅ |
| `git init` + 首次提交 | ✅ 提交 `9e687fa`，42 个文件 / 21179 行 |
| 关联远程 `origin` | ✅ `https://github.com/zkf-cn/BiddingBox.git`（**未写入令牌**） |
| `git push` | ❌ **403 被拒** |

## 失败原因

```
remote: Permission to zkf-cn/BiddingBox.git denied to zkf-cn.
fatal: unable to access 'https://github.com/zkf-cn/BiddingBox.git/': The requested URL returned error: 403
```

权限探测结果：

| 探测项 | 需要的权限 | 结果 |
|--------|-----------|------|
| `GET /user`、列出仓库 | — | ✅ 200 |
| `GET /repos/zkf-cn/BiddingBox` | Metadata: read | ✅ 200 |
| `GET /repos/.../collaborators` | Administration: read | ✅ 200 |
| `PATCH /repos/...`（改描述） | Metadata: write | ✅ 200 |
| `PUT /repos/.../contents/...` | **Contents: write** | ❌ 403 `Resource not accessible by personal access token` |

**结论**：这个 fine-grained PAT 没勾 **Contents（内容）读写权限**。git push 走的就是 Contents 权限，
和"能读仓库、能改描述"不是一回事，所以元数据和协作者接口都通、唯独推不上去。

## 你需要做的（约 30 秒）

1. 打开 <https://github.com/settings/personal-access-tokens>，选 **Fine-grained tokens**
2. 点开当前这个令牌 → **Edit**
3. **Repository access**：选 `Only select repositories` 并勾上 `BiddingBox`（或选 All repositories）
4. **Permissions** → **Repository permissions** → 找到 **Contents** → 改成 **Read and write**
   （若之后要开 GitHub Pages，顺手把 **Pages** 也设为 Read and write）
5. 保存。fine-grained 令牌编辑权限后**字符串不变**，无需重新生成

然后告诉我"令牌改好了"，我直接重推——本地仓库、提交、远程都已配好，只需一条 `git push`。

## 改好后我会执行的命令

```bash
git push -u origin main
```

## 后续可选项

- **GitHub Pages 上线**：本应用是纯静态 Vite 站点，仓库又是 public，可以一键开 Pages。
  需要先在 `react-vite/vite.config.js` 里加 `base: './'`（当前资源用绝对路径 `/assets/...`，
  在 `https://zkf-cn.github.io/BiddingBox/` 这种子路径下会 404），再配一个 Actions 工作流
  自动 build + 部署。要的话说一声。
- **代码分割**：产物 558KB（gzip 169KB）超过 Vite 默认告警线，可按需做 `manualChunks`。

## 安全提醒

这个 PAT 是以明文形式贴在对话里传给我的，且具备账号级读权限与仓库元数据写权限。
**建议用完后到令牌设置页 Revoke（撤销）**，后续改用 SSH key 或 `git credential manager`，
避免长期明文口令外泄。
