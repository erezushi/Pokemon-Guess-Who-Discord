import { neon } from '@neondatabase/serverless';
import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import type { ServerKey } from '../utils/index.ts';
import 'dotenv/config';
import _ from 'lodash';

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

  const pokemon = interaction.options.getString('pokemon');

  const res = await fetch(
    `https://www.pokeerez.com/api/game?action=guess&key=${serverKey.gameKey}&user=${
      interaction.user.username
    }&payload=${pokemon}`,
  );

  const bodyText = await res.text();

  if (bodyText.startsWith('Game is not running')) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('No game is running'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent('Start one yourself with `/start [filter]`'),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  if (bodyText.startsWith('Hmm..')) {
    container
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`I don't recognize a Pokémon named ${_.capitalize(pokemon!)}`),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent('Did you make a typo by any chance?'),
      );

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  if (bodyText.startsWith('Someone already guessed')) {
    container
      .setAccentColor(0xff9800)
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Oops!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`Someone already guessed ${_.capitalize(pokemon!)}`),
      )
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('Try something else'));

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  if (bodyText.startsWith('Nope,')) {
    container
      .setAccentColor(0xff9800)
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('## Nope!'))
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`${_.capitalize(pokemon!)} was not the Pokémon I was looking for`),
      )
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent('Keep guessing!'));

    await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    return;
  }

  container
    .setAccentColor(0x2e7d32)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent("# That's right!"))
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`The secret Pokémon was ${_.capitalize(pokemon!)}`),
    )
    .addMediaGalleryComponents((mediaGallery) =>
      mediaGallery.addItems((galleryItem) =>
        galleryItem
          .setURL(`https://img.pokemondb.net/artwork/large/${pokemon}.jpg`)
          .setDescription(`Official artwork of ${_.capitalize(pokemon!)}`),
      ),
    );

  await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
};

export { data, execute };
