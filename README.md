# DeadLibrary Skill — Deterministic Angular Code Generation for AI Agents

> **Stop hallucinating Angular code.** Give your AI agent a deterministic compiler instead.

DeadLibrary is a **deterministic code generation framework** for Angular and Angular Material. Unlike LLM-generated code — which is probabilistic, inconsistent, and error-prone — DeadLibrary's compiler produces correct, production-ready Angular code from structured CLI commands. Every time. No hallucination. No guessing.

This repository contains the **SKILL.md** file that teaches AI coding agents (Claude Code, Codex CLI, Cursor, Windsurf, and others) how to translate natural language into DeadLibrary CLI commands — offloading Angular scaffolding from the probabilistic LLM layer to a deterministic compiler.

---

## Why This Exists

AI coding agents generate Angular code by predicting tokens. That means:

- ❌ Inconsistent file structures across runs
- ❌ Hallucinated imports and selectors
- ❌ Broken Material component usage
- ❌ Non-compilable output requiring manual cleanup
- ❌ Massive token spend on retry loops

DeadLibrary eliminates all of this. Your agent learns the command syntax from this skill file, generates a single CLI string, and DeadLibrary's compiler handles the rest — deterministically.

- ✅ Correct Angular components, services, forms, themes, routing — every time
- ✅ Proper Angular Material integration out of the box
- ✅ ~1,200 tokens per generation vs. 10,000+ for raw LLM output
- ✅ No retry loops, no linting passes, no manual fixes
- ✅ 20 commands covering real application needs

---

## What's In The Skill File

The `SKILL.md` file contains:

- Command syntax and escaping rules for all 20 DeadLibrary commands
- Shared command options (naming, change detection, imports, children)
- Template element and button shape specifications
- Full option tables and examples for every command
- Critical rules that prevent malformed output (JSON escaping, naming conventions, required flags)

### Supported Commands

| Command | What It Generates |
|---------|-------------------|
| `bloc` | General content display component |
| `b` | Button component |
| `bm` | Bottom sheet / modal |
| `c` | Material card |
| `cc` | Carousel with navigation |
| `ep` | Expansion panel / accordion |
| `ff` | Single form field |
| `fg` | Form group with validation |
| `gl` | Grid list layout |
| `img` | Image display component |
| `le` | Loading spinner / progress bar |
| `lp` | Lazy-loaded page with routing |
| `m` | Dropdown menu |
| `modal` | Popup dialog |
| `mt` | Mobile toolbar |
| `sn` | Side navigation |
| `sv` | Angular services |
| `tabs` | Tabbed interface |
| `tbar` | Desktop toolbar |
| `theme` | Customizable Theme system and global styles |

---

## Installation

### Claude Code

```bash
# Clone into your skills directory
git clone https://github.com/DeadDevelopment/DeadLibrary-CLI.git ~/.claude/skills/deadlibrary-skill
```

Or manually copy `SKILL.md` into `~/.claude/skills/deadlibrary-skill/SKILL.md`.

### Codex CLI

```bash
git clone https://github.com/DeadDevelopment/DeadLibrary-CLI.git ~/.codex/skills/deadlibrary-skill
```

### Cursor / Windsurf / Other Agents

Add the `SKILL.md` file to your agent's context, custom instructions, or rules directory per your tool's documentation.

### Manual

Download `SKILL.md` from this repo and include it in your agent's system prompt or skill configuration.

---

## Quick Example
 
**You say:**
> "Build me a contact form with name, email, and message fields and a send button"
 
**Your agent outputs:**
```
dead g "fg -n contact-form -g contactGroup --language angular-20 -f [{"lbl":{"val":"Name"},"input":{"sel":"input","fieldType":"mat-input","required":true}},{"lbl":{"val":"Email"},"input":{"sel":"input","fieldType":"mat-input","inputType":"email","required":true,"validator":"Validators.email"}},{"lbl":{"val":"Message"},"input":{"sel":"mat-textarea","fieldType":"mat-textarea"}}] -b [{"lbl":"Send","type":"mat-flat-button","fn":"onSubmit()"}]"
```
 
**DeadLibrary compiles:** A complete Angular component with FormGroup, reactive form controls, Material form fields, validation, and a submit handler. Correct. Every time.
 
---
 
## Getting Started with DeadLibrary
 
DeadLibrary is a cloud-hosted service by [Dead Development LLC](https://deaddevelopment.com).
 
```bash
npm install -g deadlibrary-cli
```
 
### `dead demo` — Try without an account
 
Run DeadLibrary instantly with no signup or authentication. Limited to three commands: `fg`, `gl`, and `theme`.
 
```bash
dead demo "fg -n contact-form -g contactGroup --language angular-20 -f [{\"lbl\":{\"val\":\"Name\"},\"input\":{\"sel\":\"input\",\"fieldType\":\"mat-input\",\"required\":true}}] -b [{\"lbl\":\"Send\",\"type\":\"mat-flat-button\",\"fn\":\"onSubmit()\"}]"
```
 
AI-assisted parsing is also available in demo mode:
 
```bash
dead demo "build a 3-column grid list with project cards" --ai gl
```
 
### `dead signup` — Create an account
 
Create a Dead Development account directly from the CLI. No browser required.
 
```bash
dead signup -e you@example.com -p yourpassword
```
 
Or run `dead signup` interactively to be prompted for credentials. Optional flags: `-u` for username, `-c` for company name.
 
### `dead login` — Authenticate
 
Log in to an existing account.
 
```bash
dead login -e you@example.com -p yourpassword
```
 
### `dead subscribe` — Start your free trial
 
Opens Stripe checkout in your browser to start a 7-day free trial. Requires an account (`dead signup` or `dead login` first).
 
```bash
dead subscribe
```
 
**$50/month** after trial. Unlocks all 20 commands with unlimited generations.
 
### `dead g` — Generate code (subscribers)
 
Full access to all 20 commands. Requires an active subscription or free trial.
 
```bash
dead g "b --language angular-20 -n submit-order -b [{\"lbl\":\"Place Order\",\"type\":\"mat-flat-button\",\"fn\":\"onSubmit()\"}]"
```
 
---
 
## Quick Start for AI Agents
 
An AI agent can get running with zero human interaction using `demo`:
 
```bash
dead demo "theme -n my-app --language angular-20 --primary #6200ee --accent #03dac6" --ai theme
```
 
For full access to all 20 commands, the agent (or its operator) can create an account and subscribe:
 
```bash
dead signup -e agent-owner@example.com -p securepassword
dead subscribe
# operator completes Stripe checkout in browser
dead g "b --language angular-20 -n submit-order -b [{\"lbl\":\"Place Order\",\"type\":\"mat-flat-button\",\"fn\":\"onSubmit()\"}]"
```
 
---

## How It Works

```
Developer Intent  →  AI Agent (reads SKILL.md)  →  CLI Command String  →  DeadLibrary Compiler  →  Production Angular Code Written to Current Working Directory
     (natural         (probabilistic layer:           (deterministic           (deterministic            (correct, every
      language)         intent translation)              input)                  compilation)               time)
```

The AI handles what it's good at — understanding intent. DeadLibrary handles what requires determinism — generating code. This is **Command-Based Development**: separating the probabilistic from the deterministic.

---

## Links

- **Website:** [deaddevelopment.com](https://deaddevelopment.com)
- **Skill File:** [SKILL.md](./SKILL.md)
- **Company:** Dead Development LLC — Fort Worth, TX

---

## Keywords

`angular` `angular-material` `code-generation` `deterministic` `deterministic-code-generation` `cli` `ai-agent` `ai-coding-assistant` `claude-code` `codex` `cursor` `windsurf` `developer-tools` `scaffolding` `component-generator` `skill-file` `mcp` `llm-tooling` `command-based-development`

---

## License

The `SKILL.md` file is provided for use with AI coding agents. DeadLibrary's compiler and API are proprietary software owned by Dead Development LLC. Usage requires an active free trial or subscription.