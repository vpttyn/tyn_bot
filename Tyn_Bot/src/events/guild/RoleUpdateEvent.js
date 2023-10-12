const Discord = require('discord.js')
const {embedMessage} = require("../../utils/Utils");
const {addRankToInviterDB, getInviterDB} = require("../../storage/CreditsStorage");

module.exports = {
    name: Discord.Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember, newMember) {
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            const role = newMember.roles.cache.find(r => !oldMember.roles.cache.has(r.id));
            if (role) {
                const userDB = await getInviterDB(newMember.id);
                let claimedRank = [];
                if (userDB) {
                    claimedRank = userDB.data.claimedRank;
                }
                const tierContent = config.bonusRoles[role.name];
                if (role.name === config.verifyRole.name && !claimedRank.includes(config.verifyRole.name)) { // Verify role
                    await main.getDatabase().addCredit(newMember.id, config.verifyRole.credit, false, 'nhận role verify');
                    await addRankToInviterDB(newMember.id, config.verifyRole.name)
                    newMember.send({
                        embeds: [embedMessage(`Bạn đã nhận được ${config.verifyRole.credit} <:vvcl:1135935565301305374> vì nhận được role **${config.verifyRole.name}**!`)]
                    })
                    return;
                }
                if (tierContent) {
                    if (!claimedRank.includes(role.name)) {
                        await main.getDatabase().addCredit(newMember.id, tierContent.credit, false, `nhận role ${role.name}`);
                        await addRankToInviterDB(newMember.id, role.name)
                        newMember.send({
                            embeds: [embedMessage(`Bạn đã nhận được ${tierContent.credit} <:vvcl:1135935565301305374> vì nhận được role **${role.name}**!`)]
                        })
                    }
                }
            }
        }
    }
}