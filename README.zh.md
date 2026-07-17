<p align="center">
  <img src="assets/logo.png" width="260" alt="frugal — 刚在账单上发现一笔不认识的 $0.30 扣费的大叔" />
</p>

<h1 align="center">frugal</h1>

<p align="center"><b>给 coding agent 的云成本意识。</b></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@yuanbopang/frugal"><img src="https://img.shields.io/npm/v/%40yuanbopang%2Ffrugal?color=cb3837&label=npm" alt="npm" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" /></a>
  <a href="https://github.com/yuanboP/frugal/actions/workflows/test.yml"><img src="https://github.com/yuanboP/frugal/actions/workflows/test.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/services-22%20groups-blue" alt="22 个服务组" />
  <img src="https://img.shields.io/badge/hosts-11%2B-8A2BE2" alt="11+ 宿主" />
</p>

<p align="center"><a href="README.md">English</a> | 简体中文</p>

---

Agent 部署 Vercel、开 Neon 数据库、跑 E2B 沙箱、一次 push 触发 GitHub Actions——全都按量计费，而不懂技术的用户往往月底看账单才傻眼。frugal 让 agent 花钱前先睁眼：查用量、一句话报备付费动作、用完拆干净。

支持 Claude Code、Codex、GitHub Copilot、Qoder、Gemini CLI、OpenCode、pi、Cursor、Windsurf、Cline、Kiro——一套规则,一个真相来源。

## 它如何帮你省钱

两层机制，上下文成本都很低（每会话固定约 2KB 规则 + 每天最多 5 条一行提醒，绝不挡路）：

- **会话规则**（SessionStart，常驻）：首次碰服务先查用量、创建付费资源先报备、临时资源必须死、记住告警不是刹车、付费档会 fail open。
- **按需数据**（PreToolUse，按命令触发）：`vercel` → Vercel 的数字，`wrangler r2` → R2 的数字，仓库有 `.github/workflows/` 时的 `git push` → Actions 分钟数——精确数字只在相关时才出现，每服务每会话一次。

这个 skill 的范围是**正常使用但没留意计费方式导致账单起飞**——用错档位、忘了拆的资源、循环打到了付费额度、没人注意到的配置默认值。不处理密钥泄漏或欺诈,那是安全问题,不是成本意识问题。frugal 内化的 272 条 X 真实事故里几个代表案例，以及现在会先拦住它们的检测点：

| 真实账单 | 发生了什么 | frugal 的拦截 |
|---|---|---|
| **$36,000/月** | Cloudflare 队列自循环（3.13B 次 KV 写入） | `wrangler` → "CF 全线无硬顶——警惕递归" |
| **$104,000** | Netlify 爆红流量账单（改革前） | `netlify` → 讲清 credit 制度与硬暂停 |
| **$46,000** | 爆红流量打到 Vercel，Bot Protection 默认关闭 | `vercel` → Bot Protection 免费但默认关 |
| **$25,672** | GCP 花费冲破 $10 预算（告警滞后 24-48h） | 规则：**告警不是刹车**——要配额硬顶配合 |
| **约 $700/月** | agent push 循环在 macOS runner 上跑全量 CI | 带 workflows 的 `git push` → timeout-minutes + concurrency + macOS 约 10 倍价 |
| **$5,000/月** | 100 用户规模下 Firestore useEffect 读循环 | `firebase` → 按读计费 + maxInstances + 递归检查 |
| **$1,200** | Claude CLI 悄悄切到按 token 计费而非订阅 | 环境有 `ANTHROPIC_API_KEY` 时跑 `claude` → 双轨计费警告 |

## 它做什么

- **会话规则**（SessionStart 注入，~2KB）：首次碰计费服务先查用量；创建付费资源前一句话告知；临时资源必须死；告警不是刹车（云预算只发邮件且数据滞后 24-48h）；付费档 fail open——超额账单无上限，先确认消费上限存在。
- **命令级即时提醒**（PreToolUse）：shell 命令碰到计费 CLI 时，一行带真实数字的提醒进入 agent 上下文——每服务每会话一次，每天最多 5 次，绝不挡路。检测到子服务级：`wrangler r2`、`gh workflow run`、带 workflows 的 `git push`、环境里有 `ANTHROPIC_API_KEY` 时跑 `claude`。
- **真实数据**：22 组服务的免费额度/各档配额/超额单价，2026-07 双引擎调研（Claude 网络检索 + grok CLI 并行、交叉验证、官方 pricing 页优先）；272 条 X 真实踩坑事故内化为检测规则（全部经现行计费模式核验）。完整表格见 [`skills/frugal/references/`](skills/frugal/references/)，原始调研档案见 [`research/`](research/)。

## 安装

npm 包：[`@yuanbopang/frugal`](https://www.npmjs.com/package/@yuanbopang/frugal)

**Claude Code**：

```
/plugin marketplace add yuanboP/frugal
/plugin install frugal
```

**Codex**：`codex plugin marketplace add yuanboP/frugal && codex plugin add frugal@frugal`

**Copilot CLI**：`copilot plugin marketplace add yuanboP/frugal && copilot plugin install frugal@frugal`

**grok**：`grok plugin install https://github.com/yuanboP/frugal.git --trust`

**Gemini CLI**：`gemini extensions install https://github.com/yuanboP/frugal`

**OpenCode**：`opencode.json` 里加 `{ "plugin": ["@yuanbopang/frugal"] }`

**pi**：`pi install git:github.com/yuanboP/frugal`

**Cursor / Windsurf / Cline / Kiro**：静态规则副本随仓库自动生效；Cursor 用户级安装：把 `.cursor/rules/frugal.mdc` 拷到 `~/.cursor/rules/`。

**Qoder / CodeWhale / Swival**：自动读仓库根的 `AGENTS.md`，零配置。

## 测试

```
npm test
```

MIT
