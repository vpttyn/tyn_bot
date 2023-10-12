const Discord = require('discord.js')
const {embedMessage, getRankIcon, countItemsInString} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('takecredits')
        .setDescription('Lấy credit của người dùng')
        .addUserOption(option => option
            .setName("user")
            .setDescription("Người dùng")
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName("credit")
            .setDescription("Số credit")
            .setRequired(true)
        ),
    admin: true,
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const credit = interaction.options.getInteger('credit');
        if (user.bot) {
            await interaction.reply({
                embeds: [embedMessage(`Không thể thêm credit cho bot!`)],
                ephemeral: true
            });
            return;
        }
        await main.getDatabase().removeCredit(user.id, credit, 'admin take');
        await interaction.reply({
            embeds: [embedMessage(`Đã lấy **${credit}** <:vvcl:1135935565301305374> của **${user.username}**!`)]
        })
    }
}
