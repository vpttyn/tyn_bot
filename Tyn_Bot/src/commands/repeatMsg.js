const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('repeatmsg')
        .setDescription('Lặp lại tin nhắn')
        .addStringOption(option => option
            .setName("message")
            .setDescription("Tin nhắn")
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName("times")
            .setDescription("Số giây lặp lại")
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("Kênh")
            .setRequired(true)
        ),
    admin: true,
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const times = interaction.options.getInteger('times');
        const channel = interaction.options.getChannel('channel');
        if (times < 1) {
            await interaction.reply({
                embeds: [embedMessage(`Số giây lặp lại không được nhỏ hơn 1!`)],
                ephemeral: true
            });
            return;
        }
        await interaction.reply({
            embeds: [embedMessage(`Đã bắt đầu lặp lại tin nhắn **${message}** trong **${times}** giây!`)]
        });
        const interval = setInterval(async () => {
            await channel.send(message);
        }, times * 1000);
        main.getClient().intervals.push(interval);
    }
}
