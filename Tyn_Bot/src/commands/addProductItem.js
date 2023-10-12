const Discord = require('discord.js')
const {embedMessage, getRankIcon} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('addproductitem')
        .setDescription('Thêm sản phẩm')
        .addStringOption(option => option
            .setName("id")
            .setDescription("ID sản phẩm")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("item")
            .setDescription("Sản phẩm")
            .setRequired(true)
        ),
    admin: true,
    async execute(interaction) {
        const id = interaction.options.getString('id');
        const item = interaction.options.getString('item');
        const product = await main.getDatabase().getProduct(id);
        if (!product) {
            await interaction.reply({
                embeds: [embedMessage(`Sản phẩm không tồn tại!`)],
                ephemeral: true
            });
            return;
        }
        await main.getDatabase().addProductItem(product.id, item);
        await interaction.reply({
            embeds: [embedMessage(`Sản phẩm đã được thêm vào **${product.name}**!`)],
            ephemeral: true
        });
    }
}
