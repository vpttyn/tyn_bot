const Discord = require('discord.js')
const {Status} = require("discord.js");

module.exports = {
    name: Discord.Events.ClientReady,
    once: true,
    async execute() {
        main.getClient().user.presence.set({
            status: Status.Idle,
            activities: [{
                name: config.presence,
                type: Discord.ActivityType.Playing
            }]
        })
        const guilds = main.getClient().guilds.cache;
        guilds.forEach(guild => {
            guild.invites.fetch().then(async invites => {
                if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
                main.getClient().guildInvites.set(guild.id, invites);
            })
        })
    }
}