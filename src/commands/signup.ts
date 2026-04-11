import { Command } from 'commander'
import { signupHandler } from "../handlers/signupHandler"

export function signup(program: Command) {
  program
    .command('signup')
    .description('Create an account with Dead Development in order to get full access to DeadLibrary API')
    .option('-e, --email <string>', 'Your email address')
    .option('-p, --password <string>', 'Create a password')
    .option('-c, --company <string>', 'Optional. Enter your company name')
    .option('-u, --username <string>', 'Optional. Create a username')
    .action(async (options) => {
      try {
        await signupHandler(options);
      } catch (error: any) {
        console.error('Sign Up failed: ', error.message)
      }
    })
}
