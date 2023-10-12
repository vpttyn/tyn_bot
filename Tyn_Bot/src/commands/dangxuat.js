const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");
const {deleteUser, getUser} = require("../storage/UserStorage");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('dangxuat')
        .setDescription('Đăng Xuất'),
    async execute(interaction) {
        const user = interaction.user;
        const userAccount = await getUser(user.id);
        if (!userAccount) {
            await interaction.reply({
                embeds: [embedMessage(`Bạn chưa đăng nhập!`)],
                ephemeral: true
            });
            return;
        }
        await interaction.reply({
            embeds: [embedMessage(`Đăng xuất thành công!`)],
            ephemeral: true
        });
        for (const tier in config.ranks) {
            const role = await interaction.guild.roles.fetch(config.ranks[tier].role);
            if (role) {
                if (interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.remove(role);
                }
            }
        }
        await deleteUser(user.id);
    }
}
