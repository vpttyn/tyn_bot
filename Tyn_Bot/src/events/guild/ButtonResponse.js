const Discord = require('discord.js')
const {isAdmin, embedMessage} = require("../../utils/Utils");
const {ChannelType} = require("discord-api-types/v6");

module.exports = {
    name: Discord.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        const customId = interaction.customId;
        if (customId.startsWith("buy_")) {
            const productId = customId.split("_")[1];
            const purchased = await main.getDatabase().getPurchased(interaction.user.id);
            if (purchased.includes(productId)) {
                await interaction.update({
                    embeds: [embedMessage(`Bạn đã mua sản phẩm vào lần này rồi!`)],
                    components: [],
                    ephemeral: true
                });
                return;
            }
            const product = await main.getDatabase().getProduct(productId);
            if (!product) {
                await interaction.update({
                    embeds: [embedMessage(`Sản phẩm không còn tồn tại!`)],
                    components: [],
                    ephemeral: true
                });
                return;
            }
            const user = interaction.user;
            const credit = await main.getDatabase().getCredit(user.id);
            const item = await main.getDatabase().getFirstItemInProduct(product.id);
            if (!item) {
                await interaction.update({
                    embeds: [embedMessage(`Sản phẩm này đã hết!`)],
                    components: [],
                    ephemeral: true
                });
                return;
            }
            if (!credit || credit < product.price) {
                await interaction.update({
                    embeds: [embedMessage(`Bạn không đủ <:vvcl:1135935565301305374> để mua sản phẩm này!`)],
                    components: [],
                    ephemeral: true
                });
                return;
            }
            await main.getDatabase().removeCredit(user.id, product.price, `mua sản phẩm ${product.name}`);
            await main.getDatabase().removeProductItem(product.id, item);
            await main.getDatabase().addPurchased(user.id, productId);
            interaction.user.send({
                embeds: [embedMessage(`Sản phẩm của bạn là \`\`\`${item}!\`\`\``)]
            })
            await interaction.update({
                embeds: [embedMessage(`${user} đã mua thành công **${product.name}** với giá **${product.price}** <:vvcl:1135935565301305374>!`)],
                components: [],
            });
        }
        if (customId === "cancel") {
            await interaction.update({
                embeds: [embedMessage(`Bạn đã hủy mua sản phẩm!`)],
                components: [],
                ephemeral: true
            });
        }
    }
}