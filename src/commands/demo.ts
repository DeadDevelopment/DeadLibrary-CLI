import { Command } from 'commander';
import { demoHandler } from '../handlers/demoHandler';

export function demo(program: Command) {
  program
    .command('demo')
    .description('Try DeadLibrary without an account. Limited to fg, gl, and theme commands.')
    .argument('<raw>', 'Command string.')
    .option("-f, --fileName <string>", "Select the file for which the output is written locally.")
    .option("-p, --path <string>", "Specify path of file creation, or the existing file the generation will be written to. Defaults to current working directory.", "./")
    .option("-o, --commandOrder <number>", "Select the position the command will register within a file comprised of commands.", parseInt)
    .option("-l, --line <number>", "Set the line a generation is written to.", parseInt)
    .option("-c, --column <number>", "Set the column in line (-l) a generation is written to.", parseInt)
    .action(async (raw, options) => {
      try {
        await demoHandler(raw, options);
      } catch (error: any) {
        console.error('Error generating code:', error.message);
      }
    });
}