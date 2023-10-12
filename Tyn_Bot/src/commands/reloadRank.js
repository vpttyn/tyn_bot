const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");
const {getPlayerRank, getRankInfo, refeshToken} = require("../utils/Auth");
const {getUser, deleteUser} = require("../storage/UserStorage");
const {getInviterDB, addRankToInviterDB, getRemoved, setRemoved} = require("../storage/CreditsStorage");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('reloadrank')
        .setDescription('Reload lại rank của bạn'),
    async execute(interaction) {
        const user = interaction.user;
        await refeshToken(user.id);
        const userinfo = await getUser(user.id);
        await interaction.deferReply({
            ephemeral: true
        });
        if (!userinfo) {
            await interaction.editReply({
                embeds: [embedMessage(`${user}, Bạn chưa liên kết tài khoản!`)],
                ephemeral: true
            });
            return;
        }
        let rank = await getPlayerRank(userinfo);
        if (!rank) {
            await deleteUser(user.id);
            await interaction.editReply({
                embeds: [embedMessage(`${user}, tài khoản bị thay đổi vui lòng liên kết lại!`)],
                ephemeral: true
            })
            return;
        }
        const rankInfo = await getRankInfo(rank.tier);
        const tierName = rankInfo.tierName.split(" ")[0].toUpperCase();
        for (const tier in config.ranks) {
            const role = await interaction.guild.roles.fetch(config.ranks[tier].role);
            if (role) {
                if (interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.remove(role);
                }
            }
        }
        const rankRoleID = config.ranks[tierName].role;
        const rankRole = await interaction.guild.roles.fetch(rankRoleID);
        await interaction.member.roles.add(rankRole);
        const userDB = await getInviterDB(user.id);
        await interaction.editReply({
            embeds: [embedMessage(`Reload rank thành công\nRank của bạn là **${rankInfo.tierName}**!`)],
            ephemeral: true
        });
        let inviter = null;
        let claimedRank = [];
        if (userDB) {
            inviter = userDB.data.inviterId;
            claimedRank = userDB.data.claimedRank;
        }
        if (!claimedRank.includes(tierName)) {
            await main.getDatabase().addCredit(user.id, config.ranks[tierName].credit, false, `đạt rank ${tierName}`);
            await addRankToInviterDB(user.id, tierName)
            user.send({
                embeds: [embedMessage(`Bạn đã nhận được ${config.ranks[tierName].credit} <:vvcl:1135935565301305374> vì đã đạt rank **${tierName}**!`)]
            })
        }
        if (inviter) {
            await main.getDatabase().addCredit(inviter, 40, false, `mời người chơi đạt rank ${tierName}`);
            const inviterUser = await interaction.guild.members.fetch(inviter);
            if (!inviterUser) return;
            inviterUser.send({
                embeds: [embedMessage(`Bạn đã nhận được 40 <:vvcl:1135935565301305374> vì bạn đã mời **${user.username}** đạt rank **${tierName}**!`)]
            })
        }
    }
}