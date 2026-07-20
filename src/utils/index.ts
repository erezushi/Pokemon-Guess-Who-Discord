import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  type CacheType,
} from 'discord.js';

export interface ClientEvent {
  name: string;
  once?: boolean;
  execute: (...params: any) => void;
}

export interface ServerKey {
  guildID: number;
  gameKey: string;
}

export const commandCollection = new Collection<
  string,
  {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
  }
>();
