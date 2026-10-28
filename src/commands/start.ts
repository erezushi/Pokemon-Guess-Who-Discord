import { neon } from '@neondatabase/serverless';
import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';
import { romanize } from 'romans';
import { TYPE_COLORS, TYPE_IMAGES, type PokemonType, type ServerKey } from '../utils/index.ts';
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

  const generation = interaction.options.getInteger('generation');
  const type = interaction.options.getString('type') as PokemonType;

  if (!generation && !type) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("You can't play without choosing a filter!"),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  if (generation && type) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("you can't set both filters at once!"),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=start&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }&payload=${type ?? generation}`,
  );

  const bodyText = await res.text();

  if (bodyText.startsWith('Game is already running')) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent('Someone already started a game. Join in with `/guess [Pokémon]`'),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  container.addTextDisplayComponents((textDisplay) => textDisplay.setContent('# Game started!'));

  if (generation) {
    const receivedTyping = bodyText.match(/Typing: (.*)\./)![1]?.split('/') as PokemonType[];

    container
      .setAccentColor(TYPE_COLORS[receivedTyping[0]!])
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`### You chose generation ${romanize(generation)}.`),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`The Pokémon I generated has a typing of`),
      )
      .addMediaGalleryComponents((mediaGallery) =>
        mediaGallery.addItems(
          receivedTyping.map(
            (receivedType) => (mediaItem) =>
              mediaItem
                .setURL(TYPE_IMAGES[receivedType])
                .setDescription(`${receivedType}-type icon`),
          ),
        ),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("Place your guesses with '/guess [Pokémon]'"),
      );
  } else {
    const receivedGen = bodyText.match(/Gen (.*)\./)![1];

    container
      .setAccentColor(TYPE_COLORS[_.capitalize(type)])
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('### You chose the'))
      .addMediaGalleryComponents((mediaGallery) =>
        mediaGallery.addItems((mediaItem) =>
          mediaItem
            .setURL(TYPE_IMAGES[_.capitalize(type)])
            .setDescription(`${_.capitalize(type)}-type icon`),
        ),
      )
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('### type.'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`The Pokémon I generated is from Generation ${receivedGen}.`),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("Place your guesses with '/guess [Pokémon]'"),
      );
  }

  await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
};

export { data, execute };
