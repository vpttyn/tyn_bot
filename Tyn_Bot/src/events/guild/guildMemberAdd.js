const Discord = require("discord.js");
const {embedMessage} = require("../../utils/Utils");


module.exports = {
    name: Discord.Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        if(member.partial) member = await member.fetch();
        if(member.user.bot) return;
        const cachedInvites = main.getClient().guildInvites.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();
        const usedInvite = newInvites.find(inv => inv.uses > cachedInvites.get(inv.code).uses);
        if(member.guild.vanityURLCode) newInvites.set(member.guild.vanityURLCode, await member.guild.fetchVanityData());
        main.getClient().guildInvites.set(member.guild.id, newInvites);
        if(!usedInvite) return;
        let inviter = await member.guild.members.fetch(usedInvite.inviter);
        if(!inviter) return;
        const user = inviter.user;
        if (user.bot) return;
        const invites = await main.getDatabase().getInvites(user.id);
        if (invites >= config.LIMIT_INVITE) return;
        const credits = await main.getDatabase().getCredit(member.id);
        if (credits) return; // Detect user has join before
        await main.getDatabase().addInvite(user.id, member.id, usedInvite.code);
        await main.getDatabase().addCredit(member.id, 1, false, `Tạo profile lần đầu!`);
        await main.getDatabase().addCredit(user.id, config.INVITE_CREDIT, false, `invite ${member.user.username}`);
        
        user.send({
            embeds: [embedMessage(`Bạn đã nhận được ${config.INVITE_CREDIT} <:vvcl:1135935565301305374> vì đã invite ${member} vào server!`)]
        });
    }
}