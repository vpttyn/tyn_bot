const Discord = require('discord.js')
const {isAdmin, embedMessage} = require("../../utils/Utils");
const {ChannelType} = require("discord-api-types/v6");
const {ButtonBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        const customId = interaction.customId;
        if (customId === "shop") {
            await interaction.deferReply({
                ephemeral: true
            });
            const value = interaction.values[0];
            const product = await main.getDatabase().getProduct(value);
            if (!product) {
                await interaction.editReply({
                    embeds: [embedMessage(`Sản phẩm đã hết hàng!`)]
                });
                return;
            }
            const buyButton = new ButtonBuilder()
                .setCustomId("buy_" + product.id)
                .setLabel("Mua")
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji({
                    name: '💰'
                });
            const cancelButton = new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Hủy")
                .setStyle(Discord.ButtonStyle.Danger)
                .setEmoji({
                    name: '❎'
                })
            const row = new ActionRowBuilder()
                .addComponents(buyButton, cancelButton);
            const currentCredit = await main.getDatabase().getCredit(interaction.user.id);
            await interaction.editReply({
                embeds: [embedMessage(`Bạn có muốn mua **${product.name}**\nVới giá **${product.price}** credits?\n\nBạn đang có **${currentCredit}** credits!`)],
                components: [row]
            });
        }
    }
}