import { Command } from 'commander';
import { demoHandler } from '../handlers/demoHandler';

export function demo(program: Command) {
  program
    .command('demo')
    .description('Try DeadLibrary without an account. Limited to fg, gl, and theme commands.')
    .argument('<raw>', 'Command string.')
    .option('--ai <string>', 'Enable AI-assisted parsing by entering the shorthand name of the DeadLibrary CLI command you want to use.')
    .action(async (raw, options) => {
      try {
        await demoHandler(raw, options);
      } catch (error: any) {
        console.error('Demo failed:', error.message);
      }
    });
}