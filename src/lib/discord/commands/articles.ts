import { SlashCommandBuilder } from 'discord.js';
import { getPublicArticlesByDomain } from '../../cms/articles';

export default {
  builder: new SlashCommandBuilder()
                .setName('blogs')
                .setDescription('Get latest blogs')
                .addStringOption(option => option.setName("domain").setDescription("The domain of blog I have access to.")),
  execute: async (interaction: {
    options: any;
    reply: (arg0: string) => any; 
  }) => {
    const domain = interaction.options.getString("domain");
    const articles = await getPublicArticlesByDomain(domain);
    
		return interaction.reply(`Articles: ${JSON.stringify(articles)}`);
  }
}
