import axios from 'axios';
import { getIdToken } from '../utils/auth';
import { ui } from '../utils/ui';
import ora from 'ora';

const PRICE_ID = 'price_1S3n4xKXKNRCl8VuD7WycMX6';
const CREATE_SUBSCRIPTION_URL = 'https://us-central1-deadlibrary-53c38.cloudfunctions.net/createSubscription';

export async function subscribeHandler() {
  const spinner = ora('Preparing subscription checkout...').start();

  try {
    const idToken = await getIdToken();

    const resp = await axios.post(CREATE_SUBSCRIPTION_URL, 
      { priceId: PRICE_ID },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }
    );

    if (resp.status === 401) {
      spinner.fail(ui.err('Not authenticated. Run `dead login` first.'));
      return;
    }

    if (resp.status === 400) {
      spinner.fail(ui.err(resp.data?.error || 'Subscription request failed.'));
      return;
    }

    if (resp.status !== 200 || !resp.data?.checkoutUrl) {
      spinner.fail(ui.err('Failed to create checkout session.'));
      return;
    }

    spinner.succeed(ui.ok('Checkout session created.'));

    const { default: open } = await import('open');
    await open(resp.data.checkoutUrl);

    console.log(ui.label('Opening Stripe checkout in your browser...'));
    console.log(ui.label('After completing checkout, run `dead g` to start generating.'));

  } catch (error: any) {
    spinner.fail(ui.err('Subscription failed.'));
    throw new Error(`Subscribe failed: ${error.message}`);
  }
}
