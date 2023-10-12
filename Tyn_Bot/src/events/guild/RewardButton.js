const Discord = require('discord.js')
const {isAdmin, embedMessage} = require("../../utils/Utils");
const {ChannelType} = require("discord-api-types/v6");

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.channel.type === ChannelType.DM) return;
        if (interaction.customId === 'diemdanh') {
            const userid = interaction.user.id
            const current = await main.getDatabase().getRewardDay(userid);
            const currentday = new Date().toLocaleDateString('vi-VN');
            if (current === currentday) {
                await interaction.reply({
                    embeds: [embedMessage(`Bạn đã nhận phần thưởng hôm nay rồi!`)],
                    ephemeral: true
                });
                return;
            }
            await main.getDatabase().setRewardDay(userid);
            let creditsReceived = 0;
            if (interaction.member.roles.cache.has(config.verifyRole.id)) {
                creditsReceived += config.verifyRole.ddCredit;
            } else {
                await interaction.reply({
                    embeds: [embedMessage(`Bạn chưa nhận được phần thưởng vì chưa có role **${config.verifyRole.name}**!`)],
                    ephemeral: true
                })
                return;
            }
            for (const tier in config.ranks) {
                const role = await interaction.guild.roles.fetch(config.ranks[tier].role);
                if (role) {
                    if (interaction.member.roles.cache.has(role.id)) {
                        creditsReceived += config.ranks[tier].ddCredit;
                        break;
                    }
                }
            }
            await main.getDatabase().addCredit(userid, creditsReceived, false, `nhận phần thưởng hằng ngày`);
            await interaction.reply({
                embeds: [embedMessage(`Bạn đã nhận được **${creditsReceived}** <:vvcl:1135935565301305374> hằng ngày!`)],
                ephemeral: true
            });
        }
    }
}