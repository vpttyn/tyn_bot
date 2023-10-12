const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('topcredits')
        .setDescription('Xem top credit của server'),
    async execute(interaction) {
        const user = interaction.user;
        let allCredit = await main.getDatabase().getAllCredits(user.id);
        if (!allCredit) {
            await interaction.reply({
                embeds: [embedMessage(`Không có credit nào!`)]
            });
            return;
        }
        let description = "";
        allCredit.sort((a, b) => b.credit - a.credit);
        let i = 0;
        for (const [key, value] of Object.entries(allCredit)) {
            if (i >= 10) {
                break;
            }
            try {
                const member = await interaction.guild.members.fetch(value.id);
                if (member) {
                    i++;
                    description += `Top **${i}** thuộc về **${member.user.username}** với **${value.credit}** <:vvcl:1135935565301305374>\n`;
                }
            } catch (e) {
            }
        }
        await interaction.reply({
            embeds: [embedMessage(`**TOP CREDIT CỦA SERVER**\n\n${description}`)],
            ephemeral: true
        });
    }
}
