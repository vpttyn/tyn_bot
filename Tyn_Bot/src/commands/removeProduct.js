const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('deleteproduct')
        .setDescription('Xóa sản phẩm')
        .addStringOption(option => option
            .setName("id")
            .setDescription("ID sản phẩm")
            .setRequired(true)
        ),
    admin: true,
    async execute(interaction) {
        const id = interaction.options.getString('id');
        const product = await main.getDatabase().getProduct(id);
        if (!product) {
            await interaction.reply({
                embeds: [embedMessage(`Sản phẩm không tồn tại!`)],
                ephemeral: true
            });
            return;
        }
        await main.getDatabase().deleteProduct(product.id);
        await main.getDatabase().sortProducts();
        await interaction.reply({
            embeds: [embedMessage(`Sản phẩm **${product.name}** đã được xóa!`)]
        })
    }
}
