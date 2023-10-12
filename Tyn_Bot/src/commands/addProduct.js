const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('addproduct')
        .setDescription('Thêm sản phẩm')
        .addStringOption(option => option
            .setName("name")
            .setDescription("Tên sản phẩm")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("price")
            .setDescription("Giá sản phẩm")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("description")
            .setDescription("Mô tả sản phẩm")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("emoji")
            .setDescription("Emoji sản phẩm")
            .setRequired(true)
        ),
    admin: true,
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const emoji = interaction.options.getString('emoji');
        const emojiMsg = main.getClient().emojis.cache.get(emoji)
        await interaction.deferReply()
        if (emojiMsg === undefined) {
            await interaction.reply(embedMessage(`Emoji không hợp lệ!`));
            return;
        }
        const price = interaction.options.getString('price');
        if (isNaN(price)) {
            await interaction.reply(embedMessage(`Giá sản phẩm không hợp lệ!`));
            return;
        }
        await main.getDatabase().addProduct(name, price, description, emoji);
        await main.getDatabase().sortProducts();
        await interaction.editReply({
            embeds: [embedMessage(`Sản phẩm **${name}** với emoji là ${emojiMsg} đã được thêm!`)]
        });
    }
}
