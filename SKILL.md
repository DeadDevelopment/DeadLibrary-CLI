---
name: dead-cli
description: "Use this skill whenever generating code with DeadLibrary. DeadLibrary is a deterministic code generator that takes CLI commands and produces correct, production-ready code every time. It supports two modes: Macro Commands for multi-file Angular component scaffolding (components, services, forms, modals, toolbars, navigation, carousels, grids, tabs, expansion panels, lazy-loaded pages, themes) and Artifact Commands for single-fragment TypeScript generation (functions, classes, interfaces, enums, control flow, methods, type aliases, and more). Instead of generating code directly (which is probabilistic and error-prone), translate the user's intent into DeadLibrary CLI command strings. Trigger this skill for any code scaffolding task, or when the user mentions 'DeadLibrary', 'dead g', 'dead demo', or any command alias: bloc, b, bm, c, cc, ep, ff, fg, gl, img, le, lp, m, modal, mt, sn, sv, tabs, tbar, theme, af, cl, cf, cr, co, dg, d, dv, dw, en, et, for, fao, fin, fof, f, gr, if, it, ie, md, mo, me, n, o, pf, pg, pm, ps, sr, sw, try, type, u, v, w."
---

# DeadLibrary CLI

DeadLibrary is a deterministic code generation framework by Dead Development LLC. It uses a Command-Based Development paradigm: you provide a CLI command with structured options, and DeadLibrary's compiler generates correct, production-ready code. No hallucination, no probabilistic output, no guessing.

**Your job is to translate user intent into valid DeadLibrary CLI command strings. You are NOT generating code. You are generating CLI commands that DeadLibrary's deterministic compiler will use to produce the code.**

## Two Modes

Non-TypeScript and non-JavaScript artifact commands are currently in beta. TypeScript and JavaScript are stable.

### Macro Commands
Macro commands generate multi-file output: a directory containing template, logic, styles, and test files. Currently built for Angular and Angular Material. Use macros when the user needs a full component, service, or theme scaffold.

### Artifact Commands
Artifact commands generate a single compiled fragment targeting a specific file. They cover the full TypeScript language surface. Use artifact commands when the user needs to add or modify code in a specific file: declaring functions, classes, interfaces, control flow, methods, or building up a utility file piece by piece. Multiple artifact commands combine to compose a single file.

## How It Works

The user describes what they want in natural language. You produce CLI command strings. DeadLibrary compiles them into correct files.

**Macro invocation:** `dead g '<command-string>'`

**Artifact invocation:** `dead g '<command-string>' -f <fileName>`

Macro example: User says "make me a button called submit-order with a flat button labeled Place Order that navigates to /confirmation"

You output: `dead g 'b --language angular-20 -n submit-order -b [{"lbl":"Place Order","type":"mat-flat-button","route":"/confirmation"}]'`

Artifact example: User says "add an exported async function called fetchUser that takes an id parameter of type string and returns Promise<User>"

You output: `dead g 'f --language ts --name fetchUser --export --async --params [{"name":"id","type":"string"}] --returnType Promise<User>' -f api-helpers`

## Critical Syntax Rules

These rules are non-negotiable. Violating them will produce broken commands.

### Quoting

Wrap command strings in **single quotes**. This avoids all JSON escaping issues:
CORRECT: dead g 'bloc -n hero --language angular-20 -e [{"sel":"h1","txt":"Hello"}]'

WRONG: dead g "bloc -n hero --language angular-20 -e [{"sel":"h1","txt":"Hello"}]"

The double-quote escaped form still works and may be required in Windows cmd.exe, but single quotes are preferred in bash, zsh, and PowerShell.

### JSON Arrays

Do NOT wrap JSON arrays in extra quotes:
CORRECT: -e [{"sel":"h2"}]

WRONG: -e "[{"sel":"h2"}]"

### Naming Conventions

- **kebab-case** for: selectors, filenames, CLI flag values (e.g., `my-component`, `submit-button`)
- **camelCase** for: TypeScript identifiers: variables, properties, method names, class names (e.g., `myService`, `handleClick`)

### Output Format

Never return JSON, code blocks, or any explanation. Only output the final CLI command string(s).

### Required Flags

Every command MUST include `--language <language-value>`. This is not optional. Example: `--language ts` for TypeScript, `--language angular-20` for Angular 20. Omitting this flag will cause the command to fail.

### Optional Flags

Often, to allow flexibility, all options for a flag are optional. It is not suggested to leave each option blank, most flags will produce nothing if you leave them empty.

### Language Values

Macro commands use Angular version strings: `--language angular-20`, `--language angular-17.1`, etc.

Artifact commands use language shortcodes: `ts`, `js`, `py`, `php`, `go`, `java`, `csharp`, `rust`.

Use the same expression syntax regardless of target language. Write expressions with standard operators (`&&`, `||`, `!`, `===`, `true`, `false`, `null`, `.length`, `.push()`, `console.log()`, etc.) and the compiler produces correct output for the target language. Changing only the `--language` flag on a command produces the same logic in a different language.

### Artifact Command Language Restrictions

Most artifact commands support all eight languages. The following are restricted:

TypeScript and JavaScript only: `it` (Import), `et` (Export)

TypeScript only: `pf`, `pg`, `pm`, `ps`, `co`, `mo`, `o`, `dg`, `u`

Do not use restricted commands with unsupported languages. DeadLibrary will return an error.

## Artifact Command Flags

These flags are used with artifact commands only. They are handled by the CLI locally and are never sent to the API. **Do not use these with Macro commands.**

| Flag | Description |
|------|-------------|
| `-f, --fileName <string>` | [Required] Target output file name (without extension). |
| `-p, --path <string>` | Output directory path. Defaults to current directory. |
| `-o, --commandOrder <number>` | Insert position in the file's command manifest. Omit to append to end of file. |
| `-l, --line <number>` | Target line number for injection. Required if `-c` is used. |
| `-c, --column <number>` | Target column number for injection at value of `-l`. |

## The Manifest System

DeadLibrary tracks all generated code in a `.dead/` directory relative to where commands are run. Both Macro and Artifact commands use this system.

`.dead/manifests/` stores one JSON manifest per output file, containing the file path, a SHA-256 content hash, and an ordered list of entries. Each entry records the raw command string, its position, and the compiled fragment.

`.dead/commands/` stores command parity files (`.cmds`) with one raw command string per line. For files in subdirectories, the parity file uses `__` as a path separator (e.g., `TestBlock__TestBlock.component.html.cmds`).

### Reading Command History

When editing or extending an existing file managed by DeadLibrary, **read the corresponding `.cmds` file first** to understand what commands built the file. This tells you the command order, the aliases used, and the options passed, so you can insert, replace, or append commands correctly.

Example Using cat:
```bash
cat .dead/commands/helpers.ts.cmds
```

Example Output:
f --language ts --name myTestFunc

f --language ts --name anotherFunc

f --language ts --name thirdFunc

Use `-o` to insert at a specific position. Omit `-o` to append at the end.

### Drift Detection

If a file has been modified outside of DeadLibrary (hand edits, another tool, a merge), the CLI detects the hash mismatch and prompts before rebuilding. The user can cancel to preserve their changes or proceed to rebuild from the command history.

---

## [Macro] Shared Component Options

Most component commands share these base options. They are not repeated in each command below.

| Option | Description | Shape |
|--------|-------------|-------|
| `-n, --name <string>` | **Required.** Set filename, selector, and class name. | `"my-component"` |
| `--language <string>` | **Required.** Angular major version. Always include this flag. | `"20"` |
| `--changeDetection <string>` | Change detection strategy. | `"Default"` or `"OnPush"` |
| `--standalone` | Standalone component flag. Default: true. | boolean flag |
| `--onInit` | Add ngOnInit lifecycle hook. | boolean flag |
| `--constructorFn <array>` | Constructor arguments. | `["MyService", "AnotherService"]` |
| `--imports <array>` | File-level imports. | `[{"path":"./file.ts","name":"ImportedSymbol"}]` |
| `--children <array>` | Inject child components. | `[{"path":"../folder/component.ts","name":"ComponentName"}]` |

---

## [Macro] Template Element Shape
For commands that allow all options to be optional, leaving it blank will result in malformed compilations.
Many commands use a nested element structure referred to as "TemplateElement" throughout this document:

```
{
  "sel": "string",        // Optional HTML selector (div, h1, span, etc.) Defaults to div.
  "txt": "string",        // Optional Text content
  "cls": "string",        // Optional CSS classes
  "attr": Record<string, boolean|string>,  // Optional HTML attributes and Angular bindings
  "iterative": "NgFor",   // Optional Iteration directive
  "els": []               // Optional Nested child elements (recursive)
}
```

## [Macro] Button Shape

Many commands use a button configuration object:

```
{
  "lbl": "Click Me",          // Optional Button label
  "type": "mat-flat-button",  // Required Material button type
  "cls": "btn-class",         // Optional CSS classes
  "route": "/route",          // Optional Router link
  "fn": "handleClick()"       // Optional Click handler function
}
```

Button types: `mat-flat-button`, `mat-raised-button`, `mat-stroked-button`, `mat-icon-button`, `mat-button`, `mat-fab`, `mat-mini-fab`

---

## Artifact Commands

### Class Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--cn, --constructor <array>` | Constructor. | `[{"params":[{"name":"svc","type":"MyService","access":"private"}]}]` |
|`--me, --method <array>` | Class method. | `[{"name":"getData","access":"public","async":true,"params":[{"name":"id","type":"string"}],"returnType":"Promise<Data>"}]` |
|`--cf, --classField <array>` | Class field. | `[{"name":"count","access":"private","type":"number","value":"0","readonly":true}]` |
|`--ge, --getter <array>` | Getter. | `[{"name":"value","access":"public","returnType":"string"}]` |
|`--se, --setter <array>` | Setter. | `[{"name":"value","access":"public","param":{"name":"val","type":"string"}}]` |
|`--sb, --staticBlock <array>` | Static block. | `[{"children":[{"feature":"call","name":"init"}]}]` |
|`--is, --indexSignature <array>` | Index signature. | `[{"keyName":"key","keyType":"string","valueType":"unknown","readonly":true}]` |
|`--dc, --decorator <array>` | Decorator. | `[{"name":"Injectable","args":["providedIn: root"]}]` |
|`--pf, --privateField <array>` | Private field (native). | `[{"name":"count","type":"number","value":"0"}]` |
|`--pm, --privateMethod <array>` | Private method (native). | `[{"name":"init","params":[],"returnType":"void"}]` |
|`--pg, --privateGetter <array>` | Private getter (native). | `[{"name":"value","returnType":"string"}]` |
|`--ps, --privateSetter <array>` | Private setter (native). | `[{"name":"value","param":{"name":"val","type":"string"}}]` |
|`--mo, --methodOverload <array>` | Method overload signature (native). | `[{"name":"process","params":[{"name":"x","type":"string"}],"returnType":"string"}]` |
|`--co, --constructorOverload <array>` | Constructor overload signature (native). | `[{"params":[{"name":"x","type":"string"}]}]` |

### Enum Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--mb, --member <array>` | Enum member. | `[{"name":"Active","value":"1"},{"name":"Inactive","value":"0"}]` |

### Function Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--in, --interface <array>` | Interface declaration. | `[{"name":"MyInterface","export":true,"children":[{"feature":"property","name":"id","type":"string"}]}]` |
|`--ty, --type <array>` | Type alias declaration. | `[{"name":"Result","value":"string | number","export":true}]` |
|`--en, --enum <array>` | Enum declaration. | `[{"name":"Status","export":true,"children":[{"feature":"member","name":"Active","value":"1"}]}]` |
|`--va, --variable <array>` | Variable declaration. | `[{"name":"count","kind":"const","type":"number","value":"0"}]` |
|`--dv, --destructureVariable <array>` | Destructuring variable. | `[{"kind":"const","pattern":"object","entries":[{"key":"name"},{"key":"age"}],"value":"person"}]` |
|`--if <array>` | If/else if/else block. | `[{"condition":"x > 0","body":[{"feature":"return","value":"x"}],"elseIf":[{"condition":"x === 0","body":[{"feature":"return","value":"0"}]}],"else":[{"feature":"return","value":"-x"}]}]` |
|`--for <array>` | For loop. | `[{"init":"let i = 0","condition":"i < 10","update":"i++","body":[{"feature":"call","name":"process","args":["i"]}]}]` |
|`--fo, --forOf <array>` | For...of loop. | `[{"kind":"const","binding":"item","iterable":"items","body":[]}]` |
|`--fi, --forIn <array>` | For...in loop. | `[{"kind":"const","binding":"key","object":"obj","body":[]}]` |
|`--fa, --forAwaitOf <array>` | For await...of loop. | `[{"kind":"const","binding":"item","iterable":"stream","body":[]}]` |
|`--wh, --while <array>` | While loop. | `[{"condition":"running","body":[{"feature":"call","name":"tick"}]}]` |
|`--dw, --doWhile <array>` | Do...while loop. | `[{"condition":"retry","do":[{"feature":"call","name":"attempt"}]}]` |
|`--sw, --switch <array>` | Switch statement. | `[{"switch":"action","cases":[{"feature":"case","value":"save","body":[{"feature":"call","name":"save"}]},{"feature":"default","body":[{"feature":"break"}]}]}]` |
|`--try <array>` | Try/catch/finally. | `[{"try":[{"feature":"call","name":"fetch"}],"catch":{"binding":"e","body":[{"feature":"call","name":"log","args":["e"]}]}}]` |
|`--us, --using <array>` | Using declaration. | `[{"name":"handle","value":"getHandle()"}]` |
|`--fn, --function <array>` | Nested function. | `[{"name":"helper","params":[{"name":"x","type":"number"}],"returnType":"number"}]` |
|`--ar, --arrow <array>` | Arrow function. | `[{"params":[{"name":"x"}],"returnType":"void"}]` |
|`--cl, --class <array>` | Nested class. | `[{"name":"Inner","children":[]}]` |
|`--la, --label <string>` | Labeled statement. | |
|`--re, --return <string>` | Return statement. | expression |
|`--th, --throw <string>` | Throw statement expression. | |
|`--br, --break <string>` | Break label. | |
|`--co, --continue <string>` | Continue label. | |
|`--ca, --call <array>` | Function call. | `[{"name":"console.log","args":["message"],"typeArgs":["string"]}]` |
|`--as, --assignment <array>` | Assignment. | `[{"target":"this.value","value":"newValue","op":"="}]` |
|`--aw, --await <string>` | Await expression. | |
|`--yi, --yield <array>` | Yield expression. | `[{"expr":"value","delegate":true}]` |
|`--de, --debugger` | Insert debugger statement. | |

### Interface Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--pr, --property <array>` | Interface property. | `[{"name":"id","type":"string","optional":true,"readonly":true}]` |
|`--im, --interfaceMethod <array>` | Interface method. | `[{"name":"getData","params":[{"name":"id","type":"string"}],"returnType":"Promise<Data>","optional":true}]` |
|`--cs, --callSignature <array>` | Call signature. | `[{"params":[{"name":"x","type":"number"}],"returnType":"boolean"}]` |
|`--ct, --constructSignature <array>` | Construct signature. | `[{"params":[{"name":"opts","type":"Options"}],"returnType":"Instance"}]` |
|`--is, --indexSignature <array>` | Index signature. | `[{"keyName":"key","keyType":"string","valueType":"unknown","readonly":true}]` |

### Namespace Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--fn, --function <array>` | Function declaration. | `[{"name":"helper","params":[{"name":"x","type":"number"}],"returnType":"number"}]` |
|`--cl, --class <array>` | Class declaration. | `[{"name":"Utils","export":true}]` |
|`--in, --interface <array>` | Interface declaration. | `[{"name":"Config","export":true,"children":[{"feature":"property","name":"debug","type":"boolean"}]}]` |
|`--ty, --type <array>` | Type alias. | `[{"name":"ID","value":"string | number","export":true}]` |
|`--en, --enum <array>` | Enum declaration. | `[{"name":"Status","export":true,"children":[{"feature":"member","name":"Active"}]}]` |
|`--va, --variable <array>` | Variable declaration. | `[{"name":"MAX","kind":"const","type":"number","value":"100"}]` |
|`--dv, --destructureVariable <array>` | Destructuring variable. | `[{"kind":"const","pattern":"object","entries":[{"key":"x"}],"value":"config"}]` |
|`--ns, --namespace <array>` | Nested namespace. | `[{"name":"Inner","export":true}]` |
|`--md, --module <array>` | Module declaration. | `[{"name":"lodash","declare":true}]` |
|`--ip, --import <array>` | Import statement. | `[{"from":"./utils","named":["helper"]}]` |
|`--ex, --exportFrom <array>` | Export statement. | `[{"from":"./types","named":["Config","Options"]}]` |
|`--dc, --decorator <array>` | Decorator. | `[{"name":"sealed"}]` |
|`--os, --overloadSignature <array>` | Function overload signature (native). | `[{"name":"process","params":[{"name":"x","type":"string"}],"returnType":"string"}]` |

### Switch Children Options

| Option | Description | Shape |
|--------|-------------|-------|
|`--ca, --case <array>` | Switch case. | `[{"value":"save","body":[{"feature":"call","name":"handleSave"}]},{"value":"delete","body":[{"feature":"call","name":"handleDelete"}]}]` |
|`--df, --defaultCase <array>` | Switch default. | `[{"body":[{"feature":"call","name":"handleDefault"}]}]` |

### Arrow Function | `generateArrow`, `af`

Generate an arrow function (async function).

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-a, --async` |	Mark as async arrow. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. |	[{"name":"T"}] |
|`-p, --params <array>` | Arrow parameters. | [{"name":"x","type":"number"}] |
|`-r, --returnType <string>` | Return type annotation. | "string" |

Example:
```
af -n fetchData --language ts -t [{"name":"T"}] -p [{"name":"id","type":"string"}] -r "Promise<T>"
```


### Class | `generateClass`, `cl`

Generate a class.

**Accepts children from: Class Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Class name. | `"MyClass"` |
|`-e, --export` | Export the class. | boolean flag |
|`-d, --default` | Mark as default export. | boolean flag |
|`--declare` | Declare the class. | boolean flag |
|`--abstract` | Mark as abstract class. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T","constraint":"BaseModel"}]` |
|`-x, --extends <string>` | Class to extend. | `"BaseClass"` |
|`-i, --implements <array>` | Interfaces to implement. | `["Disposable","Serializable"]` |

Example:
```
cl -n UserService --language ts -e -x BaseService -i [OnInit, OnDestroy]
```


### Class Field | `generateClassField`, `cf`

Generate a class field.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Field name. | `"count"` |
|`--access <string>` | Access modifier. | `"public"` |
|`-s, --static` | Mark as static field. | boolean flag |
|`--readonly` | Mark as readonly. | boolean flag |
|`--abstract` | Mark as abstract field. | boolean flag |
|`--override` | Mark as override. | boolean flag |
|`--declare` | Declare the field. | boolean flag |
|`--accessor` | Use accessor keyword. | boolean flag |
|`-o, --optional` | Mark as optional. | boolean flag |
|`--definite` | Use definite assignment assertion. | boolean flag |
|`-t, --type <string>` | Type annotation. | `"number"` |
|`-v, --value <string>` | Initial value expression. | `"0"` |

Example:
```
cf -n count --language ts --access private --static --readonly -t "number" -v "0"
```


### Constructor Function | `generateConstructor`, `cr`

Generate a constructor function.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-p, --params <array>` | Constructor parameters. | `[{"name":"svc","type":"MyService","access":"private","readonly":true}]` |

Example:
```
cr -n AppConstructor --language ts -p [{"name":"router","type":"Router","access":"private"}]
```


### Constructor Overload | `generateConstructorOverload`, `co`

Generate a constructor function overload.

| Option | Description | Shape |
|--------|-------------|-------|
|`-p, --params <array>` | Parameters. | `[{"name":"x","type":"string"}]` |

Example:
```
co -n OverloadedCtor --language ts -p [{"name":"x","type":"string"}]
```


### Declare Global | `generateDeclareGlobal`, `dg`

Generate a global declaration.

**Accepts children from: Namespace Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`--children <array>` | Namespace children. | `[{"feature":"function","name":"helper","params":[{"name":"x","type":"number"}]}]` |

Example:
```
dg -n globalDecls --language ts --children [{"feature":"function","name":"init"}]
```

### Decorator | `generateDecorator`, `d`

Generate a decorator for other constructs.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Decorator name. | `"Injectable"` |
|`-a, --args <array>` | Decorator arguments. | `["providedIn: root"]` |

Example:
```
d -n Injectable --language ts -a ["providedIn: root"]
```

### Destructure Variable | `generateDestructureVariable`, `dv`

Generate a variable destructured.

| Option | Description | Shape |
|--------|-------------|-------|
|`-k, --kind <string>` | Declaration kind. | `"const"` |
|`--pattern <string>` | Destructure pattern. | `"object"` |
|`--entries <array>` | Destructure entries. | `[{"key":"name"},{"key":"age","default":"0"}]` |
|`-e, --export` | Export the variable. | boolean flag |
|`--declare` | Declare the variable. | boolean flag |
|`-t, --type <string>` | Type annotation. | `"Config"` |
|`-v, --value <string>` | Value expression. | `"config"` |

Example:
```
dv -n config --language ts -k const --pattern object --entries [{"key":"host"},{"key":"port","default":"8080"}]
```

### Do While Loop | `generateDoWhile`, `dw`

Generate a do while loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-c, --condition <string>` | Do while condition expression. | `"attempts < 3"` |

Example:
```
dw -n retryLoop --language ts -c "attempts < 3"
```

### Enum | `generateEnum`, `en`

Generate an enum.

**Accepts children from: Enum Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Enum name. | `"Status"` |
|`-e, --export` | Export the enum. | boolean flag |
|`--declare` | Declare the enum. | boolean flag |
|`-c, --const` | Mark as const enum. | boolean flag |

Example:
```
en -n Status --language ts -e -c --mb [{"name":"Active","value":"1"},{"name":"Inactive","value":"0"}]
```

### Export | `generateExport`, `et`

Generate an export or export statements.

| Option | Description | Shape |
|--------|-------------|-------|
|`-f, --from <string>` | Module path to export from. | `"./utils"` |
|`--named <array>` | Named exports. | `["Config","Options"]` |
|`--namespace <string>` | Namespace export name. | `"lodash"` |
|`--typeOnly` | Mark as type-only export. | boolean flag |
|`--assignment <object>` | Export assignment. | `{"value":"MyClass","isEquals":true}` |

Example:
```
et -n MyExport --language ts -f "./utils" --named ["Config","Options"]
```

### For Loop | `generateFor`, `for`

Generate a for loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`--init <string>` | Initializer expression. | `"let i = 0"` |
|`-c, --condition <string>` | Loop condition. | `"i < 10"` |
|`-u, --update <string>` | Update expression. | `"i++"` |

Example:
```
for -n countLoop --language ts --init "let i = 0" -c "i < 10" -u "i++"
```

### For Await Of Loop | `generateForAwaitOf`, `fao`

Generate a for await of loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-k, --kind <string>` | Binding kind. | `"const"` |
|`-b, --binding <string>` | Loop variable name. | `"item"` |
|`--iterable <string>` | Iterable expression. | `"promises"` |

Example:
```
fao -n asyncIter --language ts -k const -b "item" --iterable "promises"
```

### For In Loop | `generateForIn`, `fin`

Generate a for in loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-k, --kind <string>` | Binding kind. | `"const"` |
|`-b, --binding <string>` | Loop variable name. | `"key"` |
|`-o, --object <string>` | Object to iterate. | `"obj"` |

Example:
```
fin -n keyIter --language ts -k const -b "key" -o "obj"
```

### For Of Loop | `generateForOf`, `fof`

Generate a for of loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-k, --kind <string>` | Binding kind. | `"const"` |
|`-b, --binding <string>` | Loop variable name. | `"item"` |
|`--iterable <string>` | Iterable expression. | `"items"` |

Example:
```
fof -n arrIter --language ts -k const -b "item" --iterable "items"
```

### Function | `generateFunction`, `f`

Generate a function.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Function name. | `"processData"` |
|`-e, --export` | Export the function. | boolean flag |
|`-d, --default` | Mark as default export. | boolean flag |
|`-a, --async` | Mark as async function. | boolean flag |
|`-g, --generator` | Mark as generator function. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T","constraint":"string","default":"any"}]` |
|`-p, --params <array>` | Function parameters. | `[{"name":"id","type":"string","optional":true,"default":"null"}]` |
|`-r, --returnType <string>` | Return type annotation. | `"Promise<void>"` |

Example:
```
f -n processData --language ts -e -a -t [{"name":"T"}] -p [{"name":"id","type":"string"}] -r "Promise<void>"
```

### Getter Method | `generateGetter`, `gr`

Generate a getter.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Getter name. | `"getValue"` |
|`--access <string>` | Access modifier. | `"public"` |
|`-s, --static` | Mark as static getter. | boolean flag |
|`--abstract` | Mark as abstract getter. | boolean flag |
|`--override` | Mark as override. | boolean flag |
|`-r, --returnType <string>` | Return type annotation. | `"string"` |

Example:
```
gr -n getValue --language ts --access public -r "string"
```

### If Statement | `generateIf`, `if`

Generate an if statement of varying shapes. The `--elseIf` body arrays and `--else` array accept any entry shape from the **Function Children Options** table.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-c, --condition <string>` | If condition expression. | `"isLoggedIn"` |
|`--elseIf <array>` | Else if blocks. | `[{"condition":"x === 0","body":[{"feature":"return","value":"0"}]}]` |
|`--else <array>` | Else body. | `[{"feature":"return","value":"fallback"}]` |

Example:
```
if -n checkAuth --language ts -c "isLoggedIn" --elseIf [{"condition":"isGuest","body":[{"feature":"call","name":"redirectGuest"}]}] --else [{"feature":"call","name":"login"}]
```

### Import Statement | `generateImport`, `it`

Generate an import statement or multiple.

| Option | Description | Shape |
|--------|-------------|-------|
|`-f, --from <string>` | Module path to import from. | `"./helpers"` |
|`--named <array>` | Named imports. | `["Component","OnInit"]` |
|`-d, --default <string>` | Default import name. | `"defaultModule"` |
|`--namespace <string>` | Namespace import name. | `"lodash"` |
|`--typeOnly` | Mark as type-only import. | boolean flag |

Example:
```
it -n utils --language ts -f "./helpers" --named ["formatDate","parseJson"]
```

### Interface | `generateInterface`, `ie`

Generate an interface.

**Accepts children from: Interface Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Interface name. | `"User"` |
|`-e, --export` | Export the interface. | boolean flag |
|`--declare` | Declare the interface. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T","constraint":"Record<string, unknown>"}]` |
|`-x, --extends <array>` | Extend interfaces. | `["Serializable","Comparable"]` |

Example:
```
ie -n User --language ts -e -t [{"name":"T"}] -x ["Serializable"]
```

### Method | `generateMethod`, `md`

Generate a method.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Method name. | `"getUser"` |
|`--access <string>` | Access modifier. | `"public"` |
|`-s, --static` | Mark as static method. | boolean flag |
|`-a, --async` | Mark as async method. | boolean flag |
|`--abstract` | Mark as abstract method. | boolean flag |
|`--override` | Mark as override. | boolean flag |
|`-g, --generator` | Mark as generator method. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T"}]` |
|`-p, --params <array>` | Method parameters. | `[{"name":"id","type":"string"}]` |
|`-r, --returnType <string>` | Return type annotation. | `"Promise<Data>"` |

Example:
```
md -n getUser --language ts --access public -a -t [{"name":"T"}] -p [{"name":"id","type":"string"}] -r "Promise<T>"
```

### Method Overload | `generateMethodOverload`, `mo`

Generate a method overload signature.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Method name. | `"process"` |
|`--access <string>` | Access modifier. | `"public"` |
|`-s, --static` | Mark as static. | boolean flag |
|`-a, --async` | Mark as async. | boolean flag |
|`--abstract` | Mark as abstract. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T"}]` |
|`-p, --params <array>` | Parameters. | `[{"name":"x","type":"string"}]` |
|`-r, --returnType <string>` | Return type annotation. | `"string"` |

Example:
```
mo -n process --language ts --access public -s -a -t [{"name":"T"}] -p [{"name":"x","type":"T"}] -r "T"
```

### Module | `generateModule`, `me`

Generate a module.

**Accepts children from: Namespace Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Module name. | `"appModule"` |
|`-e, --export` | Export the module. | boolean flag |
|`--declare` | Declare the module. | boolean flag |

Example:
```
me -n appModule --language ts -e --declare
```

### Namespace | `generateNamespace`, `n`

Generate a namespace.

**Accepts children from: Namespace Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Namespace name. | `"utils"` |
|`-e, --export` | Export the namespace. | boolean flag |
|`--declare` | Declare the namespace. | boolean flag |

Example:
```
n -n utils --language ts -e
```

### Overload Signature | `generateOverloadSignature`, `o`

Generate overload signature.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Function name. | `"fetchData"` |
|`-e, --export` | Export the signature. | boolean flag |
|`-a, --async` | Mark as async. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T"}]` |
|`-p, --params <array>` | Parameters. | `[{"name":"url","type":"string"}]` |
|`-r, --returnType <string>` | Return type annotation. | `"Promise<T>"` |

Example:
```
o -n fetchData --language ts -e -a -t [{"name":"T"}] -p [{"name":"url","type":"string"}] -r "Promise<T>"
```

### Private Field | `generatePrivateField`, `pf`

Generate a private field.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Field name. | `"counter"` |
|`-s, --static` | Mark as static. | boolean flag |
|`--readonly` | Mark as readonly. | boolean flag |
|`-t, --type <string>` | Type annotation. | `"number"` |
|`-v, --value <string>` | Initial value expression. | `"0"` |

Example:
```
pf -n counter --language ts -s --readonly -t "number" -v "0"
```

### Private Getter Method | `generatePrivateGetter`, `pg`

Generate a private getter method.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Getter name. | `"getValue"` |
|`-s, --static` | Mark as static. | boolean flag |
|`-r, --returnType <string>` | Return type annotation. | `"string"` |

Example:
```
pg -n getValue --language ts -s -r "string"
```

### Private Method | `generatePrivateMethod`, `pm`

Generate a private method.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Method name. | `"init"` |
|`-s, --static` | Mark as static. | boolean flag |
|`-a, --async` | Mark as async. | boolean flag |
|`-g, --generator` | Mark as generator. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T"}]` |
|`-p, --params <array>` | Parameters. | `[{"name":"config","type":"T"}]` |
|`-r, --returnType <string>` | Return type annotation. | `"void"` |

Example:
```
pm -n init --language ts -s -a -t [{"name":"T"}] -p [{"name":"config","type":"T"}] -r "void"
```

### Private Setter Method | `generatePrivateSetter`, `ps`

Generate a private setter method.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Setter name. | `"setValue"` |
|`-s, --static` | Mark as static. | boolean flag |
|`-p, --param <object>` | Setter parameter. | `{"name":"val","type":"string"}` |

Example:
```
ps -n setValue --language ts -s -p {"name":"val","type":"string"}
```

### Setter Method | `generateSetter`, `sr`

Generate a setter.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Setter name. | `"setValue"` |
|`--access <string>` | Access modifier. | `"public"` |
|`-s, --static` | Mark as static setter. | boolean flag |
|`--abstract` | Mark as abstract setter. | boolean flag |
|`--override` | Mark as override. | boolean flag |
|`-p, --param <object>` | Setter parameter. | `{"name":"val","type":"string"}` |

Example:
```
sr -n setValue --language ts --access public -s -p {"name":"val","type":"string"}
```

### Switch Case | `generateSwitch`, `sw`

Generate a switch case. The `body` arrays within `--ca` and `--df` entries accept any entry shape from the **Function Children Options** table.

**Accepts children from: Switch Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-s, --switch <string>` | Switch expression. | `"actionType"` |

Example:
```
sw -n handleAction --language ts -s "actionType" --ca [{"value":"save","body":[{"feature":"call","name":"handleSave"}]}] --df [{"body":[{"feature":"call","name":"handleDefault"}]}]
```

### Try Catch Finally | `generateTry`, `try`

Generate a try statement (optionally catch & finally). The `--try`, `--catch` body, and `--finally` arrays accept any entry shape from the **Function Children Options** table.

| Option | Description | Shape |
|--------|-------------|-------|
|`--try <array>` | Try body. | `[{"feature":"call","name":"fetch"}]` |
|`--catch <object>` | Catch block. | `{"binding":"e","body":[{"feature":"call","name":"log","args":["e"]}]}` |
|`--finally <array>` | Finally body. | `[{"feature":"call","name":"cleanup"}]` |

Example:
```
try -n safeFetch --language ts --try [{"feature":"call","name":"fetch"}] --catch {"binding":"e","body":[{"feature":"call","name":"log","args":["e"]}]} --finally [{"feature":"call","name":"cleanup"}]
```

### Type | `generateType`, `type`

Generate a type declaration.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Type alias name. | `"Result"` |
|`-e, --export` | Export the type alias. | boolean flag |
|`-t, --typeParams <array>` | Type parameters. | `[{"name":"T","constraint":"Record<string, unknown>"}]` |
|`-v, --value <string>` | Type value expression. | `"T | null"` |

Example:
```
type -n Result --language ts -e -t [{"name":"T"}] -v "T | null"
```

### Using | `generateUsing`, `u`

Generate a using declaration.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Binding name. | `"fileHandle"` |
|`-a, --await` | Use await keyword. | boolean flag |
|`-t, --type <string>` | Type annotation. | `"FileHandle"` |
|`-v, --value <string>` | Value expression. | `"openFile()"` |

Example:
```
u -n fileHandle --language ts -a -t "FileHandle" -v "openFile()"
```

### Variable | `generateVariable`, `v`

Generate a variable.

| Option | Description | Shape |
|--------|-------------|-------|
|`-n, --name <string>` | Variable name. | `"count"` |
|`-k, --kind <string>` | Declaration kind. | `"const"` |
|`-e, --export` | Export the variable. | boolean flag |
|`--declare` | Declare the variable. | boolean flag |
|`-t, --type <string>` | Type annotation. | `"number"` |
|`-v, --value <string>` | Value expression. | `"10"` |
|`--definite` | Use definite assignment assertion. | boolean flag |

Example:
```
v -n count --language ts -k const -e --type "number" -v "10"
```

### While Loop | `generateWhile`, `w`

Generate a while loop.

**Accepts children from: Function Children Options**

| Option | Description | Shape |
|--------|-------------|-------|
|`-c, --condition <string>` | While condition expression. | `"isRunning"` |

Example:
```
w -n poll --language ts -c "isRunning"
```

---

## Macro Commands

###  Block | `generateBlock`, `bloc`

Generate a content display component with nested HTML elements and buttons. This is the most versatile component — use it for any general content layout.

| Option | Description |
|--------|-------------|
| `-e, --els <array>` | Nested HTML elements as TemplateElement array |
| `-b, --btns <array>` | Button configuration array |

Example:
```
bloc -n hero-section --language angular-20 -e [{"sel":"h1","txt":"Welcome","cls":"hero-title"},{"sel":"p","txt":"Get started today","cls":"hero-subtitle"}] -b [{"lbl":"Sign Up","type":"mat-flat-button","route":"/register"}]
```

---

### Button | `generateButton`, `b`

Generate a button element contained in a component.

| Option | Description |
|--------|-------------|
| `-b, --btns <array>` | Button configuration array |

Example:
```
b -n submit-btn --language angular-20 -b [{"lbl":"Submit","type":"mat-flat-button","fn":"onSubmit()"}]
```

---

### Bottom Modal | `generateBottomModal`, `bm`

Generate a bottom sheet/modal component with a button trigger.

| Option | Description |
|--------|-------------|
| `-t, --trig <object>` | **Required.** Trigger button configuration |
| `-m, --modal <string>` | **Required.** Modal name |
| `-e, --content <object>` | Modal content as TemplateElement |
| `-c, --closeTrig <object>` | Close button configuration |

Example:
```
bm -n cookie-notice --language angular-20 -m cookie-modal -t {"lbl":"Cookie Settings","type":"mat-stroked-button"} -e {"sel":"p","txt":"We use cookies to improve your experience."} -c {"lbl":"Accept","type":"mat-flat-button","fn":"close()"}
```

---

### Card | `generateCard`, `c`

Generate a Material card component with header, image, content, actions, and footer sections.

| Option | Description |
|--------|-------------|
| `-t, --type <string>` | **Required.** Card type (e.g., `mat-raised-button`) |
| `-c, --cls <string>` | Card CSS classes |
| `--av, --avatar <object>` | Avatar image: `{"src":"path","alt?":"string","cls?":"string"}` |
| `--ttl, --title <object>` | Card title: `{"txt?":"string","cls?":"string"}` |
| `--sttl, --subTitle <object>` | Card subtitle: `{"src":"path","cls?":"string"}` |
| `-i, --img <object>` | Card image: `{"src":"path","alt?":"string","cls?":"string"}` |
| `--ct, --content <array>` | Card content as TemplateElement array |
| `-a, --actions <object>` | Card actions: `{"cls?":"string","btns?":[ButtonShape]}` |
| `-f, --footer <array>` | Footer as TemplateElement array |

Example:
```
c -n user-profile-card --language angular-20 -t mat-raised-button --ttl {"txt":"John Doe"} --sttl {"src":"Developer"} -i {"src":"assets/profile.jpg","alt":"Profile photo"} --ct [{"sel":"p","txt":"Full-stack Angular developer."}] -a {"btns":[{"lbl":"Contact","type":"mat-flat-button","fn":"onContact()"}]}
```

---

### Carousel | `generateCarousel` `cc`

Generate a carousel component with navigation buttons.

| Option | Description |
|--------|-------------|
| `--he, --header <object>` | Header element above carousel (TemplateElement) |
| `-w, --wrapper <object>` | **Required.** Carousel wrapper: `{"sel":"string","cls?":"string","seconds?":".75","content":[...]}` |
| `--nb, --nextBtn <object>` | **Required.** Next button: `{"btn":ButtonShape,"icon":{"name":"string","aria?":"string","cls?":"string"}}` |
| `--pb, --prevBtn <object>` | **Required.** Previous button: same shape as nextBtn |

Example:
```
cc -n image-slider --language angular-20 --he {"sel":"h2","txt":"Our Work","cls":"slider-title"} -w {"sel":"div","cls":"slide-wrapper","seconds":".5","content":[{"sel":"img","attr":{"src":"assets/slide1.jpg"}},{"sel":"img","attr":{"src":"assets/slide2.jpg"}}]} --nb {"btn":{"type":"mat-icon-button"},"icon":{"name":"arrow_forward"}} --pb {"btn":{"type":"mat-icon-button"},"icon":{"name":"arrow_back"}}
```

---

### Expansion Panel | `generateExpansionPanel`, `ep`

Generate an expansion panel (accordion) list component.

| Option | Description |
|--------|-------------|
| `-a, --accordion <object>` | Accordion config: `{"cls?":"string","multi":"string"}` |
| `-p, --panels <array>` | **Required.** Panel array: `[{"panelCls?":"string","headerCls?":"string","title?":"string","titleCls?":"string","description?":"string","descriptionCls?":"string","content?":TemplateElement}]` |

Example:
```
ep -n faq-list --language angular-20 -a {"multi":"true"} -p [{"title":"What is DeadLibrary?","content":{"sel":"p","txt":"A deterministic Angular code generator."}},{"title":"How does it work?","content":{"sel":"p","txt":"CLI commands in, production code out."}}]
```

---

### Form Field | `generateFormField`, `ff`

Generate a single form field component with label, input, hints, errors, prefix/suffix.

| Option | Description |
|--------|-------------|
| `-a, --appearance <string>` | Field appearance |
| `-c, --cls <string>` | CSS classes |
| `-d, --control <string>` | Form control name |
| `-l, --lbl <object>` | Label: `{"val":"string","cls?":"string"}` |
| `--hint <object>` | Hint text: `{"val":"string","cls?":"string"}` |
| `-e, --error <object>` | Error config: `{"val":"string","cls":"string","fn":"string"}` |
| `-i, --input <object>` | **Required.** Input config (see below) |
| `-p, --prefix <object>` | Prefix: `{"val":"string","cls?":"string"}` |
| `-s, --suffix <object>` | Suffix: `{"val":"string","cls?":"string"}` |

**Input field types:** `mat-input`, `mat-textarea`, `mat-timepicker`, `mat-select`, `mat-autocomplete`, `mat-datepicker`, `mat-slide-toggle`, `mat-chip-list`

Input shape:
```
{
  "sel": "input",
  "fieldType": "mat-input",
  "inputType?": "text",
  "cls": "string",
  "required?": true,
  "validator?": "Validators.required",
  "options?": [{"lbl":"Option Label","val":"OptionValue"}]
}
```

Example:
```
ff -n email-field --language angular-20 -l {"val":"Email Address"} -i {"sel":"input","fieldType":"mat-input","inputType":"email","required":true,"validator":"Validators.email"} --hint {"val":"We will never share your email."} -e {"val":"Invalid email","fn":"hasError('email')"}
```

---

### Form Group | `generateFormGroup`, `fg`

Generate a form group with multiple fields, a FormGroup instance, and optional buttons.

| Option | Description |
|--------|-------------|
| `-g, --groupName <string>` | **Required.** FormGroup instance name |
| `-f, --fields <array>` | Field definitions (each field follows the ff shape) |
| `-b, --btns <array>` | Button array |

Example:
```
fg -n contact-form --language angular-20 -g contactGroup -f [{"lbl":{"val":"Name"},"input":{"sel":"input","fieldType":"mat-input","required":true}},{"lbl":{"val":"Email"},"input":{"sel":"input","fieldType":"mat-input","inputType":"email","required":true,"validator":"Validators.email"}},{"lbl":{"val":"Message"},"input":{"sel":"mat-textarea","fieldType":"mat-textarea"}}] -b [{"lbl":"Send","type":"mat-flat-button","fn":"onSubmit()"}]
```

---

### Grid List | `generateGridList`, `gl`

Generate a customizable grid list Angular component.

| Option | Description |
|--------|-------------|
| `-c, --cols <number>` | **Required.** Number of grid columns |
| `-r, --rowHeight <string>` | **Required.** Row height (e.g., `"32rem"`) |
| `-t, --tiles <array>` | **Required.** Tile definitions: `[{"rowspan?":"1","colspan?":"1","content?":TemplateElement}]` |

Example:
```
gl -n dashboard-grid --language angular-20 -c 3 -r 16rem -t [{"colspan":"2","content":{"sel":"h2","txt":"Revenue"}},{"content":{"sel":"h2","txt":"Users"}},{"colspan":"3","content":{"sel":"h2","txt":"Activity Feed"}}]
```

---

### Image | `generateImage`, `img`

Generate an image display component.

| Option | Description |
|--------|-------------|
| `-e, --sel <string>` | Element type (e.g., `img`, `div`) |
| `-s, --src <string>` | Image URL or file path |
| `-a, --alt <string>` | Alt text |
| `-c, --cls <string>` | CSS classes |
| `-r, --route <string>` | Router link on click |

Example:
```
img -n company-logo --language angular-20 -e img -s "assets/logo.svg" -a "Company Logo" -r "/"
```

---

### Lazy Page | `generateLazyPage`, `lp`

Generate a lazy-loaded page with route and outlet configs. Creates the page component and its routing file.

| Option | Description |
|--------|-------------|
| `-s, --sections <array>` | **Required.** Lazy-loaded sections: `[{"outlet":"primary","route":"home","name":"Home","path":"../path/name.component","el":TemplateElement}]` |

Example:
```
lp -n dashboard --language angular-20 -s [{"outlet":"primary","route":"","name":"Overview","path":"../overview/overview.component","el":{"sel":"app-overview","txt":"Overview works!"}}]
```

---

### Loading Element | `generateLoadingElement`, `le`

Generate a loading/spinner component.

| Option | Description |
|--------|-------------|
| `-s, --spinner <object>` | Progress spinner: `{"cls?":"string"}` |
| `-b, --bar <object>` | Progress bar: `{"mode":"string","cls?":"string"}` |

Example:
```
le -n page-loader --language angular-20 -s {"cls":"centered-spinner"}
```

---

### Menu | `generateMenu`, `m`

Generate a Material menu element.

| Option | Description |
|--------|-------------|
| `-p, --position <string>` | Menu position (e.g., `above`, `below`) |
| `-t, --menuTrig <object>` | **Required.** Trigger button (ButtonShape) |
| `-i, --menuItems <array>` | **Required.** Menu items: `[{"lbl":"Label","route":"/path","fn?":"fn()","val?":"string"}]` |

Example:
```
m -n user-menu --language angular-20 -t {"lbl":"Account","type":"mat-flat-button"} -i [{"lbl":"Profile","route":"/profile"},{"lbl":"Settings","route":"/settings"},{"lbl":"Logout","fn":"onLogout()"}]
```

---

### Mobile Toolbar | `generateMobileToolbar`, `mt`

Generate a toolbar component optimized for mobile/tablet with avatar, home icon, and menu.

| Option | Description |
|--------|-------------|
| `-a, --avatar <object>` | Avatar config: `{"cls?":"string","src":"string","alt?":"string","route?":"string"}` |
| `-i, --homeIcon <object>` | Home icon: `{"name":"string","cls":"string","btn":ButtonShape}` |
| `-t, --menuTrig <object>` | **Required.** Menu trigger button (ButtonShape) |
| `-m, --menuItems <array>` | **Required.** Menu items: `[{"lbl":"Label","route":"/path","fn?":"fn()","val?":"string"}]` |

Example:
```
mt -n app-mobile-toolbar --language angular-20 -a {"src":"assets/logo.png","alt":"Logo","route":"/"} -t {"lbl":"Menu","type":"mat-icon-button"} -m [{"lbl":"Home","route":"/"},{"lbl":"About","route":"/about"},{"lbl":"Contact","route":"/contact"}]
```

---

### Modal | `generateModal`, `modal`

Generate a popup modal/dialog with open and close triggers.

| Option | Description |
|--------|-------------|
| `-f, --fileName <string>` | **Required.** Modal template name |
| `--ot, --openTime <string>` | **Required.** Open animation speed (ms) |
| `--ct, --closeTime <string>` | **Required.** Close animation speed (ms) |
| `-o, --openTrig <object>` | **Required.** Open trigger button (ButtonShape) |
| `-c, --closeTrig <object>` | **Required.** Close trigger button (ButtonShape) |
| `-t, --title <object>` | Title element (TemplateElement) |
| `--co, --content <object>` | Content element (TemplateElement). **Required for children injection.** |
| `-a, --actions <object>` | Action buttons. **Required to close dialog.** |

Example:
```
modal -n confirm-delete --language angular-20 -f confirm-dialog --ot 200 --ct 100 -o {"lbl":"Delete","type":"mat-flat-button","cls":"danger-btn"} -c {"lbl":"Cancel","type":"mat-stroked-button"} -t {"sel":"h2","txt":"Are you sure?"} --co {"sel":"p","txt":"This action cannot be undone."} -a [{"lbl":"Confirm","type":"mat-flat-button","fn":"onConfirm()"}]
```

---

### Service | `generateService`, `sv` (BETA)

Generate an Angular service with dependency injection, methods, properties, and built-in utilities (BETA).

Specific options (does not use shared component options except `--name` and `--imports`):
| Option | Description |
|--------|-------------|
| `-n, --name <string>` | **Required.** Service name |
| `-l, --language <string>` | Angular version |
| `--exported` | Export the class |
| `--extends <string>` | Parent class |
| `--implements <array>` | Interfaces: `["OnDestroy"]` |
| `--decorators <array>` | Class decorators |
| `--deps <array>` | Constructor dependencies: `["logger: LoggerService"]` |
| `--autoAssign` | Auto-assign constructor args to properties |
| `--props <array>` | Class properties: `[{"name":"theme","type":"string","default":"dark","access":"private"}]` |
| `--methods <array>` | Class methods: `[{"name":"log","params":[{"name":"msg","type":"string"}],"returnType":"void","body":"console.log(msg);"}]` |
| `--imports <array>` | File imports |
| `--constructorFn <array>` | Constructor arguments |
| `--useHttp <array>` | HTTP methods: `[{"name":"getData","params":[{"name":"url","type":"string"}],"returnType":"Observable<any>","body":"return this.http.get(url);"}]` |
| `--providedIn <string>` | Provider scope: `"root"`, `"platform"`, `"any"`, `"module"` |
| `--implDestroy` | OnDestroy lifecycle hook |

Example:
```
sv -n auth --language angular-20 --props [{"name":"isLoggedIn","type":"boolean","default":"false"}] --methods [{"name":"login","params":[{"name":"email","type":"string"},{"name":"password","type":"string"}],"returnType":"Promise<void>","body":"return;"}] --useHttp [{"name":"getUser","params":[],"returnType":"Observable<any>","body":"return this.http.get('/api/user');"}]
```

---

### Side Nav | `generateSideNav`, `sn`

Generate a side navigation component.

| Option | Description |
|--------|-------------|
| `-c, --container <object>` | **Required.** Container config: `{"sel":"div","autoSize":"auto","cls?":"string"}` |
| `-d, --drawer <object>` | **Required.** Drawer config: `{"cls?":"string","mode":"side"}` |
| `-t, --trig <object>` | **Required.** Trigger button (ButtonShape) |

Example:
```
sn -n app-sidenav --language angular-20 -c {"sel":"div","autoSize":"auto"} -d {"mode":"side","cls":"main-drawer"} -t {"lbl":"Toggle Nav","type":"mat-icon-button"}
```

---

### Tabs | `generateTabs`, `tabs`

Generate a tabbed interface that displays content per tab.

| Option | Description |
|--------|-------------|
| `-c, --groupCls <string>` | Tab group CSS classes |
| `-a, --alignment <string>` | Tab alignment: `center`, `left`, `right` |
| `-t, --tabs <array>` | **Required.** Tab definitions: `[{"lbl":"string","cls?":"string","content?":TemplateElement}]` |

Example:
```
tabs -n settings-tabs --language angular-20 -a center -t [{"lbl":"General","content":{"sel":"p","txt":"General settings"}},{"lbl":"Security","content":{"sel":"p","txt":"Security settings"}},{"lbl":"Billing","content":{"sel":"p","txt":"Billing settings"}}]
```

---

### Theme | `generateTheme`, `theme`

Generate a base theme system with global styles, typography, Material theme config, color palette, and utility classes.

| Option | Description |
|--------|-------------|
| `-n, --name <string>` | Theme file name |
| `--typography <object>` | Font config: `{"plainFamily":"Nunito Sans","boldFamily":"Nunito Sans","regularWeight":"400","boldWeight":"700","plainFace":"Nunito-Regular","boldFace":"Nunito-Mono"}` |
| `--matTheme <object>` | Material theme: `{"color":"dark","typography":"custom","density":"0","type":"light"}` |
| `-d, --default` | Use the default Dead Theme |
| `-c, --colors <object>` | Color palette: `{"primary":"#a784c2","primaryLight":"#f5f5f5","primaryDark":"#666666","secondary":"#cf929a","background":"#0a0908","error":"#f94144"}` |
| `--utilityCls <object>` | Utility class generation config |

DeadDevelopment Theme Example (default theme):
```
theme -n styles -d
```

Example (custom):
```
theme -n styles --language angular-20 -c {"primary":"#1a73e8","primaryLight":"#ffffff","primaryDark":"#333333","secondary":"#ff6d00","background":"#fafafa","error":"#d32f2f"} --matTheme {"color":"dark","typography":"custom","density":"0","type":"light"}
```

---

### Toolbar | `generateToolbar`, `tbar`

Generate a toolbar with logo/avatar, title, spacer, and buttons.

| Option | Description |
|--------|-------------|
| `-c, --cls <string>` | Toolbar CSS classes |
| `-a, --avatar <object>` | Avatar/logo: `{"cls?":"string","src":"string","alt?":"string","route?":"string"}` |
| `-t, --title <object>` | Title element (TemplateElement) |
| `-s, --spacer` | Include spacer after logo |
| `-b, --btns <array>` | Button array |

Example:
```
tbar -n app-toolbar --language angular-20 -a {"src":"assets/logo.svg","alt":"Logo","route":"/"} -t {"sel":"span","txt":"My Application"} -s -b [{"lbl":"Login","type":"mat-flat-button","route":"/login"},{"lbl":"Sign Up","type":"mat-stroked-button","route":"/register"}]
```

---

## Artifact Commands Quick Reference

| Alias | Full Name | Description |
|-------|-----------|-------------|
| `af` | generateArrowFunction | Arrow function (async function) |
| `cl` | generateClass | Class declaration |
| `cf` | generateClassField | Class field |
| `cr` | generateConstructor | Constructor function |
| `co` | generateConstructorOverload | Constructor overload signature |
| `dg` | generateDeclareGlobal | Global declaration |
| `d` | generateDecorator | Decorator |
| `dv` | generateDestructureVariable | Destructured variable |
| `dw` | generateDoWhile | Do-while loop |
| `en` | generateEnum | Enum declaration |
| `et` | generateExport | Export statement |
| `for` | generateFor | For loop |
| `fao` | generateForAwaitOf | For-await-of loop |
| `fin` | generateForIn | For-in loop |
| `fof` | generateForOf | For-of loop |
| `f` | generateFunction | Function declaration |
| `gr` | generateGetter | Getter |
| `if` | generateIf | If statement |
| `it` | generateImport | Import statement |
| `ie` | generateInterface | Interface declaration |
| `md` | generateMethod | Method declaration |
| `mo` | generateMethodOverload | Method overload signature |
| `me` | generateModule | Module declaration |
| `n` | generateNamespace | Namespace declaration |
| `o` | generateOverloadSignature | Overload signature |
| `pf` | generatePrivateField | Private field |
| `pg` | generatePrivateGetter | Private getter |
| `pm` | generatePrivateMethod | Private method |
| `ps` | generatePrivateSetter | Private setter |
| `sr` | generateSetter | Setter |
| `sw` | generateSwitch | Switch statement |
| `try` | generateTry | Try-catch-finally statement |
| `type` | generateType | Type alias declaration |
| `u` | generateUsing | Using declaration |
| `v` | generateVariable | Variable declaration |
| `w` | generateWhile | While loop |

---

## Macro Commands Quick Reference

| Alias | Full Name | Description |
|-------|-----------|-------------|
| `bloc` | generateBlock | General content display component |
| `b` | generateButton | Button component |
| `bm` | generateBottomModal | Bottom sheet/modal |
| `c` | generateCard | Material card |
| `cc` | generateCarousel | Carousel with nav buttons |
| `ep` | generateExpansionPanel | Accordion/expansion panels |
| `ff` | generateFormField | Single form field |
| `fg` | generateFormGroup | Form group with multiple fields |
| `gl` | generateGridList | Grid list layout |
| `img` | generateImage | Image display component |
| `le` | generateLoadingElement | Loading spinner/bar |
| `lp` | generateLazyPage | Lazy-loaded page with routes |
| `m` | generateMenu | Dropdown menu |
| `modal` | generateModal | Popup dialog |
| `mt` | generateMobileToolbar | Mobile toolbar with menu |
| `sn` | generateSideNav | Side navigation |
| `sv` | generateService | Angular service (BETA) |
| `tabs` | generateTabs | Tabbed interface |
| `tbar` | generateToolbar | Desktop toolbar |
| `theme` | generateTheme | Theme and global styles |