const Discord = require('discord.js')
const {isAdmin, embedMessage} = require("../../utils/Utils");
const {ChannelType} = require("discord-api-types/v10");

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand() || !interaction.channel) return;
        if (interaction.channel.type === ChannelType.DM) return;
        const command = main.getClient().commands.get(interaction.commandName);
        if (!command) return;
        if (config.IS_DEV && !config.admins.includes(interaction.user.id)) {
            await interaction.reply({
                embeds: [embedMessage(`Bot đang trong quá trình bảo trì!`)],
                ephemeral: true
            });
            return;
        }
        if (command.admin) {
            if (!config.admins.includes(interaction.user.id)) {
                await interaction.reply({
                    embeds: [embedMessage(`Bạn không có quyền sử dụng lệnh này!`)],
                    ephemeral: true
                });
                return;
            }
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}