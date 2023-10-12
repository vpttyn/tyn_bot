const Discord = require('discord.js')
const {embedMessage} = require("../../utils/Utils");
const voiceChannelTracking = new Map();

module.exports = {
    name: Discord.Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        const member = newState.member;
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        if (!oldChannel && newChannel) {
            voiceChannelTracking.set(member.id, Date.now());
        } else if (oldChannel && !newChannel) {
            if (voiceChannelTracking.has(member.id)) {
                let verifyCredits = 0;
                let bonusCredit = 0;
                const currentTime = Date.now();
                const isMute = member.voice.mute;
                if (isMute) {
                    voiceChannelTracking.delete(member.id);
                    return;
                }
                const joinTime = voiceChannelTracking.get(member.id);
                const timeSpentInSeconds = Math.floor((currentTime - joinTime) / 1000);
                const timeSpentInMinutes = Math.floor(timeSpentInSeconds / 60);
                const verifyCredit = config.verifyRole.voiceCredit;
                if (oldChannel.id === config.AFKChannel) {
                    voiceChannelTracking.delete(member.id);
                    return;
                }
                if (member.roles.cache.has(config.verifyRole.id)) {
                    verifyCredits = (timeSpentInMinutes / 10) * verifyCredit;
                    bonusCredit += config.verifyRole.bonusCredit;
                }
                verifyCredits = parseInt(verifyCredits)
                bonusCredit = Math.floor(timeSpentInMinutes / 10) * bonusCredit;
                bonusCredit = parseInt(bonusCredit)
                if (bonusCredit > 0) {
                    await main.getDatabase().addCredit(newState.id, bonusCredit, false, `bonus credit voice channel ${timeSpentInMinutes} phút (bonus)`);
                    member.send({
                        embeds: [embedMessage(`Bạn đã nhận được ${bonusCredit} <:vvcl:1135935565301305374> vì đã ở trong voice channel ${timeSpentInMinutes} phút!`)]
                    })
                }
                let voiceCredit = 0;
                for (const rank in config.ranks) {
                    const info = config.ranks[rank];
                    const role = await member.guild.roles.fetch(info.role);
                    if (role) {
                        if (member.roles.cache.has(role.id)) {
                            voiceCredit += info.voiceCredit;
                        }
                    }
                }
                let credit = (timeSpentInMinutes / 10) * voiceCredit;
                credit = parseInt(credit)
                if (credit > 0) {
                    await main.getDatabase().addCredit(newState.id, credit, false, `voice channel ${timeSpentInMinutes} phút (rank)`);
                    member.send({
                        embeds: [embedMessage(`Bạn đã nhận được ${credit} <:vvcl:1135935565301305374> vì đã ở trong voice channel ${timeSpentInMinutes} phút!`)]
                    })
                } else if (verifyCredits > 0) {
                    await main.getDatabase().addCredit(newState.id, verifyCredits, false, `voice channel ${timeSpentInMinutes} phút (verify)`);
                    member.send({
                        embeds: [embedMessage(`Bạn đã nhận được ${verifyCredits} <:vvcl:1135935565301305374> vì đã ở trong voice channel ${timeSpentInMinutes} phút!`)]
                    })
                }
            }
            voiceChannelTracking.delete(member.id);
        }
    }
}