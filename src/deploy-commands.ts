import { REST, Routes } from 'discord.js';
import * as commands from './commands/index.ts';
import 'dotenv/config';

const commandArray = Object.values(commands).map((command) => command.data.toJSON());

const rest = new REST({ version: '10' });
rest.setToken(process.env['BOT_TOKEN']!);

try {
  console.log(`Started refreshing ${commandArray.length} application (/) commands.`);

  await rest.put(Routes.applicationCommands(process.env['APPLICATION_ID']!), {
    body: commandArray,
  });

  console.log(`Successfully refreshed ${commandArray.length} application (/) commands.`);
} catch (error) {
  console.error(error);
}
