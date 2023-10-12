const Discord = require('discord.js')
const {embedMessage, getRankIcon, countItemsInString} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('addcredits')
        .setDescription('Thêm credit cho người dùng')
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
                embeds: [embedMessage(`Không thể thêm <:vvcl:1135935565301305374> cho bot!`)],
                ephemeral: true
            });
            return;
        }
        await main.getDatabase().addCredit(user.id, credit, true, 'quản trị viên thêm');
        await interaction.reply({
            embeds: [embedMessage(`Đã thêm **${credit}** <:vvcl:1135935565301305374> cho **${user.username}**!`)]
        })
    }
}
