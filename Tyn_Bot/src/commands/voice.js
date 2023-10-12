const Discord = require('discord.js')
const {embedMessage, getRankIcon} = require("../utils/Utils");
const {bold} = require("discord.js");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('voice')
        .setDescription('Tìm đồng đội')
        .addStringOption(option => option
            .setName("rank")
            .setDescription("Rank của bạn")
            .setRequired(true)
            .addChoices(
                {name: "Iron", value: "iron"},
                {name: "Bronze", value: "bronze"},
                {name: "Silver", value: "silver"},
                {name: "Gold", value: "gold"},
                {name: "Platinum", value: "platinum"},
                {name: "Diamond", value: "diamond"},
                {name: "Ascendant", value: "ascendant"},
                {name: "Immortal", value: "immortal"},
                {name: "Radiant", value: "radiant"}
            )
        )
        .addStringOption(option => option
            .setName("msg")
            .setDescription("Lời nhắn của bạn")
            .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.user;
        const member = interaction.member;
        if (!interaction.member.voice.channel) {
            await interaction.reply({
                embeds: [embedMessage(`Bạn phải vào voice channel trước khi sử dụng lệnh này!`)]
            });
            return;
        }
        const rank = interaction.options.getString("rank");
        const msg = interaction.options.getString("msg");
        const rankIcon = getRankIcon(rank);
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
                name: user.username,
                iconURL: user.avatarURL()
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
                    value: "> **" + bold(rank.toUpperCase()) + "**",
                    inline: true
                }
            )
            .setFooter({
                text: "Cách sử dụng: /voice <rank> <msg>",
                iconURL: "https://i.imgur.com/tZEQHDp.gif"
            })
            .setThumbnail(rankIcon ? rankIcon : "");
        await interaction.reply({
            content: user.toString() + " " + (msg ? msg : ""),
            embeds: [embed],
            components: [actionsRow]
        });
    }
}