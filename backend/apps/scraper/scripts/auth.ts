import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const apiId = Number(process.env.TELEGRAM_API_ID!);
const apiHash = process.env.TELEGRAM_API_HASH!;
const stringSession = new StringSession('');

const rl = readline.createInterface({ input, output });

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    const phoneNumber = await rl.question('Enter phone number: ');

    await client.start({
        phoneNumber,
        password: async () => await rl.question('Please enter your password: '),
        phoneCode: async () =>
            await rl.question('Please enter the code you received: '),
        onError: (err) => console.error('Error during auth:', err),
    });

    console.log('You should now be connected.');
    console.log(client.session.save()); // Save this string to avoid logging in again

    rl.close();
    process.exit();
})();
