import { ERRORS } from '../utils/utils';
import { ENDPOINTS } from '../utils/endpoints';
import { writeAtomicFiles, writeMacroFiles } from '../utils/gWriter';
import { getIdToken } from '../utils/auth';
import { ui } from '../utils/ui';
import ora from 'ora';
import { renderApiError } from '../utils/shared';

export async function gHandler(
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
  const spinner = ora('Calling DeadLibrary API...').start()

  async function callDeadLibraryAPI(forceRefresh = false) {
    const idToken = await getIdToken(forceRefresh);

    const payload: any = { raw };

    return fetch(ENDPOINTS.g, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  let resp = await callDeadLibraryAPI(false);

  if (resp.status === 401) {
    console.log(ui.warn('Status: 401, refreshing token...'));
    resp = await callDeadLibraryAPI(true);
  }

  if (resp.status !== 200) {
    spinner.fail(ui.err(`DeadLibrary API Status: ${resp.status}`));
    const data = await resp.json().catch(() => null);
    renderApiError(data);
    return;
  }

  const data = await resp.json();

  spinner.succeed(ui.ok(`DeadLibrary API Status: ${resp.status}`))
  

  if (data?.writeInstructions) {
    const secs = ((Date.now() - start) / 1000).toFixed(2)
    console.log(ui.label(`Files prepared in ${secs}s`))

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
  spinner.fail(ui.err(ERRORS.HANDLER_TRY))
}

