import { neon } from '@neondatabase/serverless';
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('reset');
data.setDescription('Stop the running game prematurely');
data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

data.addBooleanOption((option) => {
  option.setName('delete-manager-score');
  option.setDescription("Set to true to delete tha Game Manger's scores");

  return option;
});

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const serverKey = (
    await sql`SELECT * FROM "DiscordKeys" WHERE "guildID" = ${interaction.guildId}`
  )[0] as ServerKey;

  if (!serverKey) {
    interaction.editReply(
      'Server is not registered to play. Please run the `/register` command by a moderator',
    );
    return;
  }

  const deleteManagerScore = interaction.options.getBoolean('delete-manager-score');

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=reset&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }&payload=${deleteManagerScore}`,
  );

  const bodyText = await res.text();

  interaction.editReply(bodyText.replace('!guesswho ', '/'));
};

export { data, execute };
