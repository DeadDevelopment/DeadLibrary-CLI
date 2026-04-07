import { Command } from 'commander'
import { gHandler } from '../handlers/gHandler'

export function g(program: Command) {
  program
    .command('g')
    .description('Send a DeadLibrary CLI command to generate code with DeadLibrary API. ex: dead g "b --language angular-20 -n MyButton -b [{\"lbl\":\"My Button\",\"type\":\"mat-flat-button\"}]"')
    .argument("<raw>", "Command string.")
    .option("--ai <string>", "Enable AI-assisted parsing by entering the shorthand name of the DeadLibrary CLI command you want to use.")
    .action(async (raw, options) => {
      try {
        await gHandler(raw, options);
      } catch (error: any) {
        console.error('Error generating code:', error.message);
      }
    })
}
