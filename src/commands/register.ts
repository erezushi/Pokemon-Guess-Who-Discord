import { neon } from '@neondatabase/serverless';
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('register');
data.setDescription('Register the server to play the game.');
data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const existingServer = (
    await sql`SELECT * FROM "DiscordKeys" WHERE "guildID" = ${interaction.guildId}`
  )[0] as ServerKey;

  if (existingServer) {
    interaction.editReply('Server is already registered');
    return;
  }

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=key&user=${interaction.user.username}`,
  );

  const bodyText = await res.text();

  const gameKey = bodyText.match(/key is (.*)\n/)?.[1];

  if (!gameKey) {
    interaction.editReply('Failed to register server. Please try again');
    return;
  }

  await sql`INSERT INTO "DiscordKeys" ("guildID", "gameKey")
    VALUES (${interaction.guildId}, ${gameKey})`;

  interaction.editReply(`Registered server with ${interaction.user.toString()} as Game Manager`);
};

export { data, execute };
