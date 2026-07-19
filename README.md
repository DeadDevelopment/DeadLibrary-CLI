# DeadLibrary Skill — Deterministic Code Generation for LLMs and Humans

> **Stop hallucinating code.** Give your AI agent a deterministic compiler instead.

DeadLibrary is a **deterministic code generation framework**. Unlike LLM-generated code, which is probabilistic, inconsistent, and error-prone, DeadLibrary produces correct, production-ready code from structured CLI commands. Every time. No hallucination. No guessing.

This package contains the **SKILL.md** file that teaches AI coding agents (Claude Code, Codex CLI, Cursor, Windsurf, and others) how to translate natural language into DeadLibrary CLI commands offloading code generation from the probabilistic LLM layer to a deterministic compiler.

---

## Why This Exists

AI coding agents generate code by predicting tokens. That means:

- ❌ Inconsistent file structures across runs
- ❌ Hallucinated imports and selectors
- ❌ Boilerplating with several different design paradigms and patterns
- ❌ Broken output requiring manual cleanup
- ❌ Massive token spend on retry loops
- ❌ Paying API costs on an entire codebase to insert an import or a method

DeadLibrary eliminates all of this. Your agent learns the command syntax from this skill file, generates CLI strings, and DeadLibrary's compiler handles the rest with determinism.

- ✅ Correct Angular Material components, services, forms, themes, routing through 20 Macro Commands
- ✅ Full TypeScript language coverage through 36 Artifact Commands
- ✅ Proper Angular Material integration out of the box
- ✅ Save tokens and API costs using AI
- ✅ Create your own custom Macro Commands with Artifacts
- ✅ 56 commands covering real application needs

---

## Two Modes of Generation

Macro commands produce a complete directory of files from a single command: a combination of template, styles, test, and logic. They target Angular and Angular Material today, with more frameworks planned for inclusion. Artifact commands produce a single compiled artifact of code that targets a specific file. Artifact commands can be used to create a file, but are designed to map multiple artifact commands to a given file. They cover the full TypeScript surface. Macros are for scaffolding whole components of code. Artifacts are for building up or modifying individual logic files, one declaration at a time. Rerunning an artifact command with the same position flag replaces the previous output in place, so editing a declaration never duplicates code. Artifacts empower the creation of custom logic Macro commands, which can be stored as a combination of commands with a manner of string interpolation via variables. Support for the upload and sharing of custom Macro commands, associated with a User Account (Subscription Required) is planned for Q3 2026. 

Macro commands currently target Angular and Angular Material using `--language angular-20` (or other Angular versions). Artifact commands target eight languages using `--language ts`, `--language py`, `--language go`, etc. Non-TypeScript and non-JavaScript artifact commands are currently in beta.

## What's In The Skill File

The `SKILL.md` file contains:

- Command syntax and escaping rules for all DeadLibrary commands
- Shared command options (naming, change detection, imports, children)
- Template element and button shape specifications
- Full option tables and examples for every command
- Critical rules that prevent malformed output (JSON escaping, naming conventions, required flags)

## Supported Languages

Artifact commands support eight language targets. Use the `--language` flag to specify the output language.

| Flag Value | Language | Formatting | Status |
|------------|----------|------------|--------|
| `ts` | TypeScript | Prettier | Stable |
| `js` | JavaScript | Prettier | Stable |
| `py` | Python | Built-in | Beta |
| `java` | Java | Prettier | Beta |
| `php` | PHP | Prettier | Beta |
| `go` | Go | gofmt (WASM) | Beta |
| `csharp` | C# | dotnet format | Beta |
| `rust` | Rust | rustfmt | Beta |

Macro commands use `--language angular-20` (or other Angular versions) and are not affected by this table.

### Formatting Requirements

TypeScript, JavaScript, Java, PHP, Go, and Python are formatted automatically by the CLI with no additional setup.

Rust and C# require their standard toolchain formatters to be installed on your system for automatic formatting:

- **Rust:** `rustfmt` (included with `rustup component add rustfmt`)
- **C#:** `dotnet format` (included with the .NET SDK)

If these tools are not installed, the CLI writes the file without formatting. Your IDE or editor can format it on open.

### Universal Expression Syntax

DeadLibrary uses a universal expression syntax across all language targets. Write your expressions once using standard operators (`&&`, `||`, `!`, `===`, `true`, `false`, `null`, etc.) and the compiler produces correct output for the target language. This means you can change the `--language` flag on any command and get the same logic compiled to a different language without rewriting expressions.

### Command Language Restrictions

Most artifact commands support all eight languages. The following commands are restricted:

**TypeScript and JavaScript only:**
- `it` (Import Statement)
- `et` (Export Statement)

**TypeScript only:**
- `pf` (Private Field)
- `pg` (Private Getter)
- `pm` (Private Method)
- `ps` (Private Setter)
- `co` (Constructor Overload)
- `mo` (Method Overload)
- `o` (Overload Signature)
- `dg` (Declare Global)
- `u` (Using Statement)

Using a restricted command with an unsupported language will return an error.

### Macro Commands (20 Commands)

Macro commands generate **multi-file output**: a complete directory with template, logic, test, and 
styles. These are built to support Angular and Angular Material code generation, with more framework
coverage coming in the future. They produce full component, service, and theme scaffolds from a single
command.

| Command Alias | What It Generates |
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

See the [Skill.md](./SKILL.md) file for the full syntax, options, and examples for every Macro command.

---

### Artifact Commands (36 Commands)

Artifact commands generate **single compiled fragments** targeting a specific file. These cover the full Typescript language surface: functions, classes, interfaces, enums, control flow, methods, type aliases, 
and more.

Use Artifact commands when you need to add code to an existing file, or use them to create a file entirely. Unlike Macro Commands, Artifacts are meant to combine to create a single file.

| Command Alias | What It Generates |
|---------------|-------------------|
| `af` | Arrow Function |
| `cl` | Class |
| `cf` | Class Field/Property |
| `cr` | Constructor |
| `co` | Constructor Overload |
| `dg` | Declare Global |
| `d` | Decorator |
| `dv` | Destructured Variable |
| `dw` | Do ... While Loop |
| `en` | Enum |
| `et` | Export |
| `for` | For Loop |
| `fao` | For Await ... Of Loop |
| `fin` | For ... In Loop |
| `fof` | For ... Of Loop |
| `f` | Function |
| `gr` | Getter Method |
| `if` | If Statement |
| `it` | Import Statement |
| `ie` | Interface |
| `md` | Method |
| `mo` | Method Overload |
| `me` | Module |
| `n` | Namespace |
| `o` | Overload Signature |
| `pf` | Private Field/Property |
| `pg` | Private Getter Method |
| `pm` | Private Method |
| `ps` | Private Setter Method |
| `sr` | Setter Method |
| `sw` | Switch Case |
| `try` | Try Catch Finally |
| `type` | Type |
| `u` | Using Statement |
| `v` | Variable |
| `w` | While Loop |

See the [Skill.md](./SKILL.md) file for the full syntax, options, and examples for every Artifact command.

### Artifact Command Flags **DO NOT USE WITH MACRO COMMANDS**

Artifact commands use local flags to control file targeting and positioning the injection of generated code into existing files. These flags are handled entirely by the CLI and are never sent as part of the API request to DeadLibrary.

| Flag | Description |
|------|-------------|
| `-f, --fileName <string>` | [Required] Target output file name (without extension). |
| `-p, --path <string>` | Output directory path. Defaults to current directory. |
| `-o, --commandOrder <number>` | Insert position in the file's command manifest. Omit to append to end of file |
| `-l, --line <number>` | Target line number for injection. |
| `-c, --column <number>` | Target the column number for injection at value of `-l`. |

## Manifest | Intent Tracking using Commands and Command Metadata

When command write operations are executed, the CLI maintains a `.dead/` directory relative to the directory where you run the command. This directory is created automatically.

`.dead/manifests/` stores one JSON manifest per output file. Each manifest contains the file path, a SHA-256 content hash, and an ordered list of entries. Each entry records a raw command string, its position in the file, and the compiled fragment it produced. If the file has been modified outside of DeadLibrary, the CLI detects the hash mismatch and prompts you before rebuilding. You can cancel to preserve your changes or proceed to rebuild from the command history.

`.dead/commands/` stores plain-text command parity files (`.cmds`) with one raw command string per line, matching the manifest order. These exist for readability: an agent or developer can read a `.cmds` file to see what commands built a file without parsing JSON or spending tokens on hashes and fragments. For files in subdirectories, the parity file uses `__` as a path separator (e.g., `TestBlock__TestBlock.component.html.cmds`).

## Installation

### Claude Code

```bash
# Copy into your skills directory
cp $(npm root -g)/deadlibrary-cli/SKILL.md ~/.claude/skills/deadlibrary-cli/SKILL.md
```

### Codex / Cursor / Windsurf / Other Agents
After global installation, the SKILL.md file is located at:
```bash
cp $(npm root -g)/deadlibrary-cli/SKILL.md
```

Copy it into your agent's context, custom instructions, or rules directory per your tool's documentation.

---

## Quick Example
 
**You say:**
> "Build me a contact form with name, email, and message fields and a send button"
 
**Your agent outputs:**
```bash
dead g 'fg -n contact-form -g contactGroup --language angular-20 -f [{"lbl":{"val":"Name"},"input":{"sel":"input","fieldType":"mat-input","required":true}},{"lbl":{"val":"Email"},"input":{"sel":"input","fieldType":"mat-input","inputType":"email","required":true,"validator":"Validators.email"}},{"lbl":{"val":"Message"},"input":{"sel":"mat-textarea","fieldType":"mat-textarea"}}] -b [{"lbl":"Send","type":"mat-flat-button","fn":"onSubmit()"}]'
```
 
**DeadLibrary compiles:** A complete Angular component with FormGroup, reactive form controls, Material form fields, validation, and submission handler boilerplate.
 
---
 
## Getting Started with DeadLibrary
 
DeadLibrary is a cloud-hosted service by [Dead Development LLC](https://deaddevelopment.com).
 
```bash
npm install -g deadlibrary-cli
```
 
### Shell Usage
Wrap DeadLibrary command strings in single quotes to avoid escaping JSON:

```bash
dead g 'fg -n contact-form --language angular-20 -f [{"lbl":{"val":"Name"},"input":{"sel":"input","fieldType":"mat-input","required":true}}]'
```

Single quotes work in bash, zsh, and PowerShell. Windows cmd.exe users should use WSL or Git Bash. If using cmd.exe directly, wrap commands in double quotes and escape inner quotes with backslashes:

```bash
dead g "fg -n contact-form --language angular-20 -f [{\"lbl\":{\"val\":\"Name\"},\"input\":{\"sel\":\"input\",\"fieldType\":\"mat-input\",\"required\":true}}]"
```

### `dead demo` — Try without an account
 
Run DeadLibrary instantly with no signup or authentication. Limited to four commands: `f`, `fg`, `gl`, and `theme`.
 
```bash
dead demo 'fg -n contact-form -g contactGroup --language angular-20 -f [{"lbl":{"val":"Name"},"input":{"sel":"input","fieldType":"mat-input","required":true}}] -b [{"lbl":"Send","type":"mat-flat-button","fn":"onSubmit()"}]'
```
 
### `dead signup` — Create an account
 
Create a Dead Development account directly from the CLI.
 
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
 
**$20/month** after trial. Unlocks all commands with unlimited generations.
 
### `dead g` — Generate code (subscribers)
 
Full access to all commands. Requires an active subscription or free trial.
 
```bash
dead g 'b --language angular-20 -n submit-order -b [{"lbl":"Place Order","type":"mat-flat-button","fn":"onSubmit()"}]'
```
 
---
 
## Quick Start for AI Agents
 
An AI agent can get running with zero human interaction using `demo`:
 
```bash
dead demo 'theme -n my-app-theme --language angular-20 -d'
```
 
For full access to all commands, the agent (or its operator) can create an account and subscribe:
 
```bash
dead signup -e agent-owner@example.com -p securepassword
dead subscribe
# Operator completes Stripe checkout in browser opened by command invocation.
```
 
---

## How It Works

```
Developer Intent  →  AI Agent (reads SKILL.md)  →  CLI Command String  →  DeadLibrary Compiler  →  Code Written to Current Working Directory or to specified file.
```

The AI handles what it's good at: translating intent into structured data. DeadLibrary handles what requires determinism: generating code. This is **Command-Based Development**: separating the probabilistic from the deterministic without limiting LLMs with a low or zero temperature configuration.

---

## Links

- **Website:** [deaddevelopment.com](https://deaddevelopment.com)
- **Skill File:** [SKILL.md](./SKILL.md)
- **Company:** Dead Development LLC — Fort Worth, TX

---

## Keywords

`angular` `angular-material` `typescript` `code-generation` `deterministic` `deterministic-code-generation` `cli` `ai-agent` `ai-coding-assistant` `claude-code` `codex` `cursor` `windsurf` `developer-tools` `scaffolding` `component-generator` `skill-file` `mcp` `llm-tooling` `command-based-development`

---

## License

The `SKILL.md` file is provided for use with AI coding agents. DeadLibrary's compiler and API are proprietary software owned by Dead Development LLC. Beyond the demo, usage requires an active free trial or subscription.