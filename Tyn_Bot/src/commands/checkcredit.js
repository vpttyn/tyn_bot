const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");
const {refeshToken} = require("../utils/Auth");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('credits')
        .setDescription('Kiểm tra credit của bạn'),
    async execute(interaction) {
        let getCredit = 0;
        const user = interaction.user;
        const credit = await main.getDatabase().getCredit(user.id);
        const getLimit = await main.getDatabase().getLimit(user.id);
        const maxLimit = await main.getDatabase().getMaxLimit(user.id);
        await refeshToken(user.id);
        if (!credit) {
            await interaction.reply({
                embeds: [embedMessage(`Bạn không có credits!`)],
                ephemeral: true
            });
            return;
        }
        for (const rank in config.ranks) {
            const info = config.ranks[rank];
            const role = await interaction.guild.roles.fetch(info.role);
            if (role) {
                if (interaction.member.roles.cache.has(role.id)) {
                    getCredit = info.voiceCredit;
                }
            }
        }
        if (getCredit <= 0) {
            if (interaction.member.roles.cache.has(config.verifyRole.id)) {
                getCredit = config.verifyRole.voiceCredit;
            }
        }
        await interaction.reply({
            embeds: [embedMessage(`Bạn đang có **${credit}** <:vvcl:1135935565301305374>!\nCredits nhận được: **${getCredit}** <:vvcl:1135935565301305374> trong 10 phút\nCredits đã nhận trong hôm nay: **${getLimit.limits}**/**${maxLimit}** <:vvcl:1135935565301305374>`)],
            ephemeral: true
        });
    }
}
