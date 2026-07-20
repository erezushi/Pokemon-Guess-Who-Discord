import { Client, GatewayIntentBits } from 'discord.js';
import { commandCollection } from './utils/index.ts';
import * as commands from './commands/index.ts';
import * as events from './events/index.ts';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

Object.values(commands).forEach((command) => {
  commandCollection.set(command.data.name, command);
});

Object.values(events).forEach(({ event }) => {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

client.login(process.env['BOT_TOKEN']);
