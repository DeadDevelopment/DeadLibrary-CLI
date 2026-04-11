import { Command } from 'commander';
import { subscribeHandler } from '../handlers/subscribeHandler';

export function subscribe(program: Command) {
  program
    .command('subscribe')
    .description('Start your 7-day free trial of DeadLibrary via Stripe checkout')
    .action(async () => {
      try {
        await subscribeHandler();
      } catch (error: any) {
        console.error('Subscribe failed:', error.message);
      }
    });
}
