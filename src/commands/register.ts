import { neon } from '@neondatabase/serverless';
import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('register');
data.setDescription('Register the server to play the game.');
data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const container = new ContainerBuilder().setAccentColor(0xe51400);

  const existingServer = (
    await sql`SELECT * FROM "DiscordKeys" WHERE "guildID" = ${interaction.guildId}`
  )[0] as ServerKey;

  if (existingServer) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent('The server is already registered! No need to do it again'),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=key&user=${interaction.user.username}`,
  );

  const bodyText = await res.text();

  const gameKey = bodyText.match(/key is (.*)\n/)?.[1];

  if (!gameKey) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("I've failed to register the server. Could you please try again?"),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  await sql`INSERT INTO "DiscordKeys" ("guildID", "gameKey")
    VALUES (${interaction.guildId}, ${gameKey})`;

  container
    .setAccentColor(0x75e900)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent('# Congratulations!'))
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent('The server is now registered!'),
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(
        `${interaction.user.toString()} is the server's manager, and can end games prematurely`,
      ),
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent('Start a game with `/start [filter]`!'),
    );

  await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
};

export { data, execute };
