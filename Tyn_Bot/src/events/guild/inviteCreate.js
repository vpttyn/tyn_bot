const Discord = require('discord.js');

module.exports = {
    name: Discord.Events.InviteCreate,
    once: false,
    async execute(invite) {
        let invites = await invite.guild.invites.fetch();
        if(invite.guild.vanityURLCode) invites.set(invite.guild.vanityURLCode, await invite.guild.fetchVanityData());
        main.getClient().guildInvites.set(invite.guild.id, invites);
    }
}