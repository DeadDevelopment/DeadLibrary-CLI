import { getIdToken } from '../utils/auth';
import { ui } from '../utils/ui';
import ora from 'ora';

const PRICE_ID = 'price_1TnnjZKXKNRCl8VutrF5aR1U';
const CREATE_SUBSCRIPTION_URL = 'https://us-central1-deadlibrary-53c38.cloudfunctions.net/createSubscription';

export async function subscribeHandler() {
  const spinner = ora('Preparing subscription checkout...').start();

  try {
    const idToken = await getIdToken();

    const resp = await fetch(CREATE_SUBSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: PRICE_ID }),
    });

    const data = await resp.json();

    if (resp.status === 401) {
      spinner.fail(ui.err('Not authenticated. Run `dead login` first.'));
      return;
    }

    if (resp.status === 400) {
      spinner.fail(ui.err(data?.error || 'Subscription request failed.'));
      return;
    }

    if (resp.status !== 200 || !data?.checkoutUrl) {
      spinner.fail(ui.err('Failed to create checkout session.'));
      return;
    }

    spinner.succeed(ui.ok('Checkout session created.'));

    const { default: open } = await import('open');
    await open(data.checkoutUrl);

    console.log(ui.label('Opening Stripe checkout in your browser...'));
    console.log(ui.label('After completing checkout, run `dead g` to start generating.'));

  } catch (error: any) {
    spinner.fail(ui.err('Subscription failed.'));
    throw new Error(`Subscribe failed: ${error.message}`);
  }
}
