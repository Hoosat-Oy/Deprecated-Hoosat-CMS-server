
import { Client, Events, GatewayIntentBits, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js'; 
import { deployCommands } from './commands/deploy';

const deployable: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
interface command {
  name: string,
  execute: any,
}
const commands: command[] = [];
  
// Import your commands. 
// Push your command data as json to deployable commands.
// Push your command name and execute to commands.
import ping from './commands/ping';
deployable.push(ping.builder.toJSON());
commands.push({name: ping.builder.name, execute: ping.execute});

import articles from './commands/articles';
deployable.push(articles.builder.toJSON());
commands.push({name: articles.builder.name, execute: articles.execute});

import pages from './commands/pages';
deployable.push(pages.builder.toJSON());
commands.push({name: pages.builder.name, execute: pages.execute});

import avatar from './commands/avatar';
deployable.push(avatar.builder.toJSON());
commands.push({name: avatar.builder.name, execute: avatar.execute});

import server from './commands/server';
deployable.push(server.builder.toJSON());
commands.push({name: server.builder.name, execute: server.execute});

import fkick from './commands/fkick';
deployable.push(fkick.builder.toJSON());
commands.push({name: fkick.builder.name, execute: fkick.execute});


export const loginDiscord = (): Client | boolean => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if(token === undefined) {
    console.log("Discord bot token has not been set.");
  } else {
    deployCommands(deployable);
    const client = new Client({ intents: [GatewayIntentBits.Guilds]});
    client.once(Events.ClientReady, (c) => {
      console.log(`Logged in as ${c.user.tag}`);
    });
    client.on(Events.InteractionCreate, async (interaction) => {
      if(!interaction.isChatInputCommand()) return;
      commands.forEach(async (command) => {
        if(command.name == interaction.commandName) {
          try {
            await command.execute(interaction);
          } catch (error) {
            console.log(error);
            if(interaction.replied || interaction.deferred) {
              await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
              await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
          }
        }
      });
    });
    client.login(token);
    return client;
  }
  return false;
}