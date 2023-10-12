const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('closerepeatmsg')
        .setDescription('Đóng msg lặp lại')
        .addIntegerOption(option => option
            .setName("id")
            .setDescription("ID")
            .setRequired(true)
        ),
    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const intervals = main.getClient().intervals;
        if (intervals.length === 0) {
            await interaction.reply({
                embeds: [embedMessage(`Không có messages nào được lặp lại!`)],
                ephemeral: true
            });
            return;
        }
        if (id < 1 || id > intervals.length) {
            await interaction.reply({
                embeds: [embedMessage(`ID không hợp lệ!`)],
                ephemeral: true
            });
            return;
        }
        const interval = intervals[id - 1];
        clearInterval(interval);
        intervals.splice(id - 1, 1);
        await interaction.reply({
            embeds: [embedMessage(`Đã đóng message lặp lại có ID **${id}**!`)]
        });
    }
}
