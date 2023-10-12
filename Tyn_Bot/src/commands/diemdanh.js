const Discord = require('discord.js')
const {embedMessage, getRankIcon, countItemsInString} = require("../utils/Utils");
const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('diemdanh')
        .setDescription('Tạo điểm danh'),
    admin: true,
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setDescription(
                '<:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015> **NHẬN CÁC THÔNG BÁO** <:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015> \n' +
                '\n' +
                '<:Empty:1132262546049597441><a:quoc24:1136326895827439826> Điểm danh sẽ nhận được phần quà tương ứng với mức Rank/Role!<a:quoc24:1136326895827439826>'
            )
            .setColor(0x6ade52);
        const button = new ButtonBuilder()
            .setCustomId('diemdanh')
            .setLabel('ĐIỂM DANH')
            .setStyle(Discord.ButtonStyle.Success);
        const actionRow = new ActionRowBuilder()
            .addComponents(button);
        await interaction.channel.send({
            embeds: [embed],
            components: [actionRow]
        });
    }
}
