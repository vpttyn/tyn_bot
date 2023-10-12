const Discord = require('discord.js')
const {embedMessage, getRankIcon, getRankName} = require("../../utils/Utils");
const {bold} = require("discord.js");

module.exports = {
    name: Discord.Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.type === Discord.ChannelType.DM) return;
        if (message.content.startsWith("+")) {
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            if (commandName === 'rank') {
                const member = message.member;
                if (!member.voice.channel) {
                    await message.reply({
                        embeds: [embedMessage(`Bạn phải vào voice channel trước khi sử dụng lệnh này!`)]
                    });

                } else {
                    const rank = args[0];
                    const msg = args.slice(1).join(" ");
                    const rankIcon = getRankIcon(rank.toLowerCase()) || "";
                    const rankName = getRankName(rank.toLowerCase() || "Unranked");
                    const channel = member.voice.channel;
                    const invite = await channel.createInvite({});
                    const button = new Discord.ButtonBuilder()
                        .setEmoji({
                            name: "🔊",
                        })
                        .setStyle(Discord.ButtonStyle.Link)
                        .setLabel("Tham Gia: " + channel.name)
                        .setURL(invite.url);
                    const actionsRow = new Discord.ActionRowBuilder()
                        .addComponents(button);
                    const embed = new Discord.EmbedBuilder()
                        .setAuthor({
                            name: message.author.username,
                            iconURL: message.author.avatarURL()
                        })
                        .addFields(
                            {
                                name: "> [Room]",
                                value: "> **" + channel.name.toUpperCase() + "**",
                                inline: true
                            },
                            {
                                name: "> [Slot]",
                                value: "> **" + channel.members.size + "**/" + channel.userLimit,
                                inline: true
                            },
                            {
                                name: "> [Rank]",
                                value: "> **" + bold(rankName) + "**",
                                inline: true
                            }
                        )
                        .setFooter({
                            text: "Cách sử dụng: +rank <rank> <msg>",
                            iconURL: "https://i.imgur.com/tZEQHDp.gif"
                        });
                    if (rankIcon !== "") embed.setThumbnail(rankIcon)
                    await message.channel.send({
                        content: message.author.toString() + "" + (msg ? msg : ""),
                        embeds: [embed],
                        components: [actionsRow]
                    })
                    message.delete();
                }
            }
        }
    }
}