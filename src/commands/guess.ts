import { neon } from '@neondatabase/serverless';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config'

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('guess');
data.setDescription('Guess the Pokémon the game chose');

data.addStringOption((option) => {
  option.setName('pokemon');
  option.setDescription('Pokémon name');
  option.setRequired(true);

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

  const pokemon = interaction.options.getString('pokemon');

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=guess&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }&payload=${pokemon}`,
  );

  const bodyText = await res.text();

  interaction.editReply(bodyText.replace('!guesswho ', '/'));
};

export { data, execute };
