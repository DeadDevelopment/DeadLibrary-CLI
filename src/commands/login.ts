import { Command } from 'commander';
import { loginHandler } from '../handlers/loginHandler';

export function login(program: Command) {
  program
    .command('login')
    .description('Authenticate with DeadLibrary to access the CLI')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Your password')
    .action(async (options) => {
      try {
        await loginHandler(options);
      } catch (error: any) {
        console.error('Login failed: ', error.message);
      }
    });
}