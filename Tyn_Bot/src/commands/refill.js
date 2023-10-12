const Discord = require('discord.js')
const {embedMessage, getRankIcon, countItemsInString} = require("../utils/Utils");
const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('refill')
        .setDescription('Fill lại các lượt mua'),
    admin: true,
    async execute(interaction) {
        await main.getDatabase().recreatePurchase();
        await interaction.reply({
            embeds: [embedMessage(`Đã fill lại các lượt mua!`)],
            ephemeral: true
        });
    }
}
