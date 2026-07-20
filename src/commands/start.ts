import { neon } from '@neondatabase/serverless';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import { romanize } from 'romans';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';

const sql = neon(process.env['DATABASE_URL']!);

const data = new SlashCommandBuilder();
data.setName('start');
data.setDescription('Starts a guess who game.');

data.addIntegerOption((option) => {
  option.setName('generation');
  option.setDescription('Pokémon generation to choose from.');
  option.setMinValue(1);
  option.setMaxValue(9);

  return option;
});

data.addStringOption((option) => {
  option.setName('type');
  option.setDescription('Pokémon type to choose from');
  option.setChoices([
    { name: 'Bug', value: 'bug' },
    { name: 'Dark', value: 'dark' },
    { name: 'Dragon', value: 'dragon' },
    { name: 'Electric', value: 'electric' },
    { name: 'Fairy', value: 'fairy' },
    { name: 'Fighting', value: 'fighting' },
    { name: 'Fire', value: 'fire' },
    { name: 'Flying', value: 'flying' },
    { name: 'Ghost', value: 'ghost' },
    { name: 'Grass', value: 'grass' },
    { name: 'Ground', value: 'ground' },
    { name: 'Ice', value: 'ice' },
    { name: 'Normal', value: 'normal' },
    { name: 'Poison', value: 'poison' },
    { name: 'Psychic', value: 'psychic' },
    { name: 'Rock', value: 'rock' },
    { name: 'Steel', value: 'steel' },
    { name: 'Water', value: 'water' },
  ]);

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

  const generation = interaction.options.getInteger('generation');
  const type = interaction.options.getString('type');

  if (!generation && !type) {
    await interaction.editReply('Please set either type or generation');
    return;
  }

  if (generation && type) {
    await interaction.editReply("Can't set both type and generation");
    return;
  }

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=start&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }&payload=${type ?? generation}`,
  );

  const bodyText = await res.text();

  await interaction.editReply(
    `Game started with ${
      generation ? `Gen ${romanize(generation)}` : `${_.capitalize(type!)} type`
    }. ${bodyText.replace('!guesswho ', '/')}`,
  );
};

export { data, execute };
