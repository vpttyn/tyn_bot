const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('intervals')
        .setDescription('Kiểm tra các messages được lặp lại'),
    async execute(interaction) {
        const intervals = main.getClient().intervals;
        if (intervals.length === 0) {
            await interaction.reply({
                embeds: [embedMessage(`Không có messages nào được lặp lại!`)],
                ephemeral: true
            });
            return;
        }
        let message = "";
        for (let i = 0; i < intervals.length; i++) {
            message += `${i + 1}. ${intervals[i]}\n`;
        }
        await interaction.reply({
            embeds: [embedMessage(`Các messages được lặp lại:\n${message}`)],
            ephemeral: true
        });
    }
}
