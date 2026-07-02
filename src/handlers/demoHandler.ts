import { ENDPOINTS } from '../utils/endpoints';
import { writeAtomicFiles, writeMacroFiles } from '../utils/gWriter';
import { ui } from '../utils/ui';
import ora from 'ora';

export async function demoHandler(
  raw: string,
  options: {
    fileName?: string,
    path?: string,
    commandOrder?: number,
    line?: number,
    column?: number
  }
) {
  
  // validate local flag combinations
  if ((options.line !== undefined || options.column !== undefined) && options.commandOrder === undefined) {
    console.error(ui.err('--commandOrder is required when using --line or --column.'));
    return;
  }

  if (options.column !== undefined && options.line === undefined) {
    console.error(ui.err('--line is required when using --column.'));
    return;
  }

  const start = Date.now();
  const spinner = ora('Calling DeadLibrary API [Demo]...').start();

  const payload: { raw: string; useAI?: string } = { raw };

  const resp = await fetch(ENDPOINTS.demo, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (resp.status !== 200) {
    spinner.fail(ui.err(`DeadLibrary API Status [Demo]: ${resp.status}`));
    console.error(ui.err(data?.error || 'Demo request failed.'));
    return;
  }

  spinner.succeed(ui.ok(`DeadLibrary API [Demo] Status: ${resp.status}`));

  if (data?.writeInstructions) {
    const secs = ((Date.now() - start) / 1000).toFixed(2);
    console.log(ui.label(`Files prepared in ${secs}s`));
    
    if (data.writeInstructions.mode === 'atomic') {
      await writeAtomicFiles(data.writeInstructions, {
        fileName: options.fileName,
        path: options.path ?? './',
        commandOrder: options.commandOrder,
        line: options.line,
        column: options.column,
      });
    } else {
      await writeMacroFiles(data.writeInstructions);
    }

    return;
  }

  if (data?.help) {
    console.log(data.help);
    return;
  }

  spinner.fail(ui.err('Response indicated failure or missing result.'));
  
}

