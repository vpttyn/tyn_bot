const Discord = require('discord.js')
const {embedMessage, getRankIcon, countItemsInString} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('stock')
        .setDescription('Thêm sản phẩm')
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
        const items = await main.getDatabase().getItemsInProduct(product.id);
        const count = countItemsInString(items);
        const channel = interaction.channel;
        channel.send({
            content: `@everyone **${product.name}** đang có **${count}** sản phẩm!\nNhanh tay đặt hàng nào!`
        })
    }
}
