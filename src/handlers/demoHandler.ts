import axios from 'axios';
import { writeGeneratedFiles } from '../utils/gWriter';
import { ui } from '../utils/ui';
import ora from 'ora';

const DEMO_ENDPOINT = 'https://deadlibrary-gw-enb9rt4.uc.gateway.dev/demoG';

export async function demoHandler(raw: string, options: { ai?: string }) {
  const start = Date.now();
  const spinner = ora('Contacting DeadLibrary Demo API...').start();

  try {
    const payload: { raw: string; useAI?: string } = { raw };
    if (typeof options.ai === 'string') payload.useAI = options.ai;

    const resp = await axios.post(DEMO_ENDPOINT, payload, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });

    if (resp.status !== 200) {
      spinner.fail(ui.err(`DeadLibrary Demo API Status: ${resp.status}`));
      console.error(ui.err(resp.data?.error || 'Demo request failed.'));
      return;
    }

    const data = resp.data;
    spinner.succeed(ui.ok(`DeadLibrary Demo API Status: ${resp.status}`));

    if (data?.writeInstructions) {
      const secs = ((Date.now() - start) / 1000).toFixed(2);
      console.log(ui.label(`Files prepared in ${secs}s`));
      await writeGeneratedFiles(data.writeInstructions);
      return;
    }

    if (data?.help) {
      console.log(data.help);
      return;
    }

    spinner.fail(ui.err('Response indicated failure or missing result.'));

  } catch (error: any) {
    spinner.fail(ui.err('Demo generation failed.'));
    throw new Error(`Demo failed: ${error.message}`);
  }
}
