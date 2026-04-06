#!/usr/bin/env node
import { Command } from "commander";
import chalk from 'chalk';
import { g } from "./commands/g";
import { login } from "./commands/login";
import { ui } from "./utils/ui";

const program = new Command();

program
  .name('dead')
  .description('DeadLibrary CLI by Dead Development LLC.')
  .version('0.2.3')
  .showSuggestionAfterError(true)
  .showHelpAfterError(ui.label('\nTip: run `dead g -h` for generator usage.\n'))

program.configureOutput({
  writeOut:  (s) => process.stdout.write(s),
  writeErr: (s) => process.stderr.write(chalk.red(s)),
  outputError: (s, write) => write(chalk.red(s)),
})

g(program);
login(program);
program.parse(process.argv);
