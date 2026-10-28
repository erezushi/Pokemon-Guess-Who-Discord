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

export type PokemonType =
  | 'Bug'
  | 'Dark'
  | 'Dragon'
  | 'Electric'
  | 'Fairy'
  | 'Fighting'
  | 'Fire'
  | 'Flying'
  | 'Ghost'
  | 'Grass'
  | 'Ground'
  | 'Ice'
  | 'Normal'
  | 'Poison'
  | 'Psychic'
  | 'Rock'
  | 'Steel'
  | 'Water';

export const TYPE_IMAGES: Record<PokemonType, string> = {
  Bug: 'https://archives.bulbagarden.net/media/upload/d/d2/BugIC_ZA.png',
  Dark: 'https://archives.bulbagarden.net/media/upload/9/91/DarkIC_ZA.png',
  Dragon: 'https://archives.bulbagarden.net/media/upload/3/30/DragonIC_ZA.png',
  Electric: 'https://archives.bulbagarden.net/media/upload/9/95/ElectricIC_ZA.png',
  Fairy: 'https://archives.bulbagarden.net/media/upload/a/ac/FairyIC_ZA.png',
  Fighting: 'https://archives.bulbagarden.net/media/upload/f/f7/FightingIC_ZA.png',
  Fire: 'https://archives.bulbagarden.net/media/upload/c/c9/FireIC_ZA.png',
  Flying: 'https://archives.bulbagarden.net/media/upload/c/c5/FlyingIC_ZA.png',
  Ghost: 'https://archives.bulbagarden.net/media/upload/2/23/GhostIC_ZA.png',
  Grass: 'https://archives.bulbagarden.net/media/upload/d/db/GrassIC_ZA.png',
  Ground: 'https://archives.bulbagarden.net/media/upload/7/76/GroundIC_ZA.png',
  Ice: 'https://archives.bulbagarden.net/media/upload/1/13/IceIC_ZA.png',
  Normal: 'https://archives.bulbagarden.net/media/upload/0/0e/NormalIC_ZA.png',
  Poison: 'https://archives.bulbagarden.net/media/upload/c/cd/PoisonIC_ZA.png',
  Psychic: 'https://archives.bulbagarden.net/media/upload/2/2b/PsychicIC_ZA.png',
  Rock: 'https://archives.bulbagarden.net/media/upload/2/29/RockIC_ZA.png',
  Steel: 'https://archives.bulbagarden.net/media/upload/9/9f/SteelIC_ZA.png',
  Water: 'https://archives.bulbagarden.net/media/upload/e/ec/WaterIC_ZA.png',
};

export const TYPE_COLORS: Record<PokemonType, number> = {
  Bug: 0x91a119,
  Dark: 0x50413f,
  Dragon: 0x5060e1,
  Electric: 0xfac000,
  Fairy: 0xef70ef,
  Fighting: 0xff8000,
  Fire: 0xe62829,
  Flying: 0x81b9ef,
  Ghost: 0x704170,
  Grass: 0x3fa129,
  Ground: 0x915121,
  Ice: 0x3fd8ff,
  Normal: 0x9fa19f,
  Poison: 0x9141cb,
  Psychic: 0xef4179,
  Rock: 0xafa981,
  Steel: 0x60a1b8,
  Water: 0x2980ef,
};
