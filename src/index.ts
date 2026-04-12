#!/usr/bin/env node
import { Command } from "commander";
import chalk from 'chalk';
import { g } from "./commands/g";
import { demo } from "./commands/demo";
import { login } from "./commands/login";
import { signup } from "./commands/signup";
import { subscribe } from "./commands/subscribe";
import { ui } from "./utils/ui";
import { readFileSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const program = new Command();

program
  .name('dead')
  .description('DeadLibrary CLI by Dead Development LLC.')
  .version(pkg.version)
  .showSuggestionAfterError(true)
  .showHelpAfterError(ui.label('\nTip: run `dead g -h` for generator usage.\n'))

program.configureOutput({
  writeOut:  (s) => process.stdout.write(s),
  writeErr: (s) => process.stderr.write(chalk.red(s)),
  outputError: (s, write) => write(chalk.red(s)),
})

g(program);
demo(program);
login(program);
signup(program);
subscribe(program);
program.parse(process.argv);
