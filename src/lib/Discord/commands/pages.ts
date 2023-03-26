import { SlashCommandBuilder } from 'discord.js';
import { getPagesByDomain } from '../../pages';

export default {
  builder: new SlashCommandBuilder()
                .setName('pages')
                .setDescription('Get pages')
                .addStringOption(option => option.setName("domain").setDescription("The domain of blog I have access to.")),
  execute: async (interaction: {
    options: any;
    reply: (arg0: string) => any; 
  }) => {
    const domain = interaction.options.getString("domain");
    const pages = await getPagesByDomain(domain);
    
    const printable = pages.pages.map(page => {
      if(page.link === "/_") {
        return `${page.name}\r\n<https://${domain}/>\r\n`
      } else {
        return `${page.name}\r\n<https://${domain}${page.link}>\r\n`
      }
    });
    
		return interaction.reply(`***HoosatCMS pages of ${domain}:***\r\n${printable.join("\r\n")}`);
  }
}
