import { Client, Events } from 'discord.js';
import type { ClientEvent } from '../utils/index.ts';

export const event: ClientEvent = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client<true>) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
