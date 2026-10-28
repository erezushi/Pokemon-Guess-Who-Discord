import { neon } from '@neondatabase/serverless';
import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('leaderboard');
data.setDescription("Show the server's leaderboard");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const serverKey = (
    await sql`SELECT * FROM "DiscordKeys" WHERE "guildID" = ${interaction.guildId}`
  )[0] as ServerKey;

  const container = new ContainerBuilder().setAccentColor(0xe51400);

  if (!serverKey) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          'The server is not registered to play. Please have a moderator run `/register`',
        ),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=leaderboard&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }`,
  );

  const bodyText = await res.text();

  container
    .setAccentColor(0x2e7d32)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent('# Leaderboard'))
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(bodyText));

  await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
};

export { data, execute };
