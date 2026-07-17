# frugal

<p align="center">
  <img src="assets/logo.png" width="280" alt="frugal — 刚在账单上发现一笔不认识的 $0.30 扣费的大叔" />
</p>

**给 coding agent 的云成本意识。** Agent 部署 Vercel、开 Neon 数据库、跑 E2B 沙箱、一次 push 触发 GitHub Actions——全都按量计费，而不懂技术的用户往往月底看账单才傻眼。frugal 让 agent 花钱前先睁眼：查用量、一句话报备付费动作、用完拆干净。

[English README](README.md)

## 它做什么

- **会话规则**（SessionStart 注入，~2KB）：首次碰计费服务先查用量；创建付费资源前一句话告知；临时资源必须死；告警不是刹车（云预算只发邮件且数据滞后 24-48h）；付费档 fail open——超额账单无上限，先确认消费上限存在。
- **命令级即时提醒**（PreToolUse）：shell 命令碰到计费 CLI 时，一行带真实数字的提醒进入 agent 上下文——每服务每会话一次，每天最多 5 次，绝不挡路。检测到子服务级：`wrangler r2`、`gh workflow run`、带 workflows 的 `git push`、命令里出现 API key 字面量、环境里有 `ANTHROPIC_API_KEY` 时跑 `claude`。
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
