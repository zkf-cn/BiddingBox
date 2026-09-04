# 部署上线指南

本项目是纯前端 SPA（Vue3 + Vite），构建产物是 `dist/` 静态目录，**任何静态托管都能跑**。
下面按推荐顺序列出三种方案，任选其一即可。

---

## 零、上线前必做检查清单

| # | 检查项 | 操作 | 不做的后果 |
| --- | --- | --- | --- |
| 1 | 本地构建通过 | `npm run build` | 线上白屏 |
| 2 | 本地预览无误 | `npm run preview` 后逐页点一遍 | 线上才发现问题，排查成本高 |
| 3 | `VITE_BASE` 与仓库名一致 | 见下方各方案 | **资源全部 404，页面空白** |
| 4 | `dist/` 下有 `.nojekyll` | 构建脚本自动生成 | GitHub Pages 忽略部分资源 |
| 5 | `dist/` 下有 `404.html` | 构建脚本自动生成 | 刷新子页面 404 |

> 第 3 项是 **90% 的 GitHub Pages 部署失败原因**：仓库叫 `gongcheng-jifei`，`VITE_BASE` 就必须写 `/gongcheng-jifei/`，首尾斜杠都不能少。

---

## 方案一：GitHub Pages（推荐，免费）

### 方式 A：GitHub Actions 自动部署（一劳永逸，推荐）

已内置工作流 `.github/workflows/deploy.yml`，推代码即自动构建部署。

**步骤：**

1. **创建仓库**
   在 https://github.com/new 新建仓库，名称记牢（后面要用），**不要勾选** README / .gitignore / License（本地已有），Public 即可（免费版 Pages 需 Public）。

2. **提交并推送代码**（在本机项目目录执行）

   ```bash
   cd "E:/编程专用/工程计费工具"

   git init
   git add .
   git commit -m "feat: 招标百宝箱 SPA 首版"

   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

   > 若提示输入密码：GitHub 已禁用密码登录，需要用 **Personal Access Token** 代替密码。
   > 生成路径：GitHub 头像 → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token，勾选 `repo` 权限。

3. **开启 Pages 的 Actions 部署模式**
   仓库页面 → **Settings** → 左侧 **Pages** → **Source** 下拉选 **GitHub Actions**（不是 "Deploy from a branch"）。

4. **触发一次构建**
   推送后 Actions 会自动跑。查看：仓库页面 → **Actions** 标签 → 看工作流是否绿色对勾。
   绿色对勾出现后，Pages 页面顶部会显示访问地址。

5. **核对基路径**
   打开工作流文件 `.github/workflows/deploy.yml`，确认这行：

   ```yaml
   env:
     VITE_BASE: /${{ github.event.repository.name }}/
   ```

   它会自动取仓库名，理论上无需手改。若你改了仓库名，重新推一次代码即可。

**验证：** 访问 `https://<用户名>.github.io/<仓库名>/`，然后**在子页面按 F5 刷新**（例如 `/calc/agent`），必须能正常显示而不是 404。这一步专门验证 404 重定向是否生效。

**常见失败原因：**

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 页面全白，控制台报一堆 404 | `VITE_BASE` 与仓库名不一致 | 核对仓库名大小写，改完重新构建推送 |
| Actions 报 `npm ci` 失败 | 仓库未提交 `package-lock.json` | `git add package-lock.json` 后重新提交 |
| Actions 报权限错误 | Pages 未切到 GitHub Actions 模式 | Settings → Pages → Source 改为 GitHub Actions |
| 首页能开，子页面刷新 404 | `dist/404.html` 未上传 | 确认 `.nojekyll` 和 `404.html` 都在仓库产物里 |
| 样式错乱但页面能开 | CDN/缓存问题 | Ctrl+F5 强制刷新 |

---

### 方式 B：手动推送 dist（不依赖 Actions）

适合不想配工作流的场景。

```bash
# 1. 构建（把 <仓库名> 换成实际名称）
VITE_BASE=/<仓库名>/ npm run build

# 2. 把 dist 推到 gh-pages 分支
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy: 构建产物"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -f origin gh-pages
cd ..
```

然后：Settings → Pages → Source 选 **Deploy from a branch** → 分支选 `gh-pages`、目录选 `/ (root)` → Save。

> **注意**：Windows 的 CMD/PowerShell 不支持 `VAR=value command` 这种前置赋值语法，请用 Git Bash 执行，或改用：
> ```powershell
> $env:VITE_BASE="/<仓库名>/"; npm run build
> ```

---

## 方案二：自有服务器（Nginx）

后期用户量上涨、需要自定义域名或 HTTPS 证书时迁移。

### 构建

```bash
# 部署到域名根目录：base 用默认 '/' 即可
npm run build

# 部署到子目录（如 https://example.com/tools/）：
VITE_BASE=/tools/ npm run build
```

### 上传

把 `dist/` 目录内**全部内容**上传到服务器目录，例如 `/var/www/gongcheng-jifei/`。

### Nginx 配置（关键：`try_files`）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gongcheng-jifei;
    index index.html;

    # SPA 路由兜底：找不到文件时回落到 index.html，交给前端路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源带 hash，可长期缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # index.html 禁止缓存，避免发版后用户还看到旧页面
    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
```

改完执行 `nginx -t` 校验语法，再 `nginx -s reload` 生效。

**HTTPS（强烈建议）：**

```bash
# 用 Let's Encrypt 免费证书
certbot --nginx -d your-domain.com
```

**验证：** 访问域名 → 进子页面按 F5 刷新 → 应正常显示。若刷新 404，说明 `try_files` 没配上。

---

## 方案三：国内平台快速托管（免备案 / 访问快）

| 平台 | 适用场景 | 注意点 |
| --- | --- | --- |
| **Gitee Pages** | 国内访问快、无需备案 | 需实名认证；仓库需 Public；每次更新要手动点"更新"按钮重新部署 |
| **腾讯云 COS 静态网站** | 稳定、可绑自有域名 | 需配置"静态网站"功能 + 错误文档设为 `index.html`（等价 404 兜底） |
| **Vercel / Netlify** | 海外访问、自动 CI | 需在平台设置里加 SPA rewrite 规则（否则刷新 404） |

腾讯云 COS 关键配置：静态网站 → **错误文档** 填 `index.html`，HTTP 状态码选 200 或 404 均可生效。

---

## 日常维护

### 政策/定额数据更新（无需改动业务代码）

依据 PRD 的可维护性要求，所有原始数据已抽离为独立 JSON：

```
src/data/
  ├── standards.json   # 9 套计费标准的费率表 + 文号 + 标准全称
  ├── quota.json       # 建筑安装工程工期定额 2645 条
  └── expert.json      # 评标专家专业分类 1793 项
```

更新流程：

1. 修改对应 JSON（保持原有字段结构不变）
2. 同步更新 `src/config.js` 里的 `DATA_VERSIONS` 版本声明
3. `npm run build` → 重新部署

### 常用命令

```bash
npm run dev       # 本地开发（默认 http://localhost:5173）
npm run build     # 生产构建（自动生成 404.html + .nojekyll）
npm run preview   # 预览构建产物（默认 http://localhost:4173）
npm run data      # 从旧版项目重新抽取数据到 src/data/*.json
node scripts/verify-calc.mjs   # 计算引擎回归验证（14 条政策算例）
```

---

## 回滚方案

**GitHub Pages（Actions 方式）**：Actions 页面 → 选中一个历史成功的运行记录 → 右上角 "Re-run all jobs"，即用旧版本代码重新部署。

**自有服务器**：发版前先备份旧目录，出问题直接换回。

```bash
cp -r /var/www/gongcheng-jifei /var/www/gongcheng-jifei.bak.$(date +%Y%m%d)
```
