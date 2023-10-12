const Discord = require('discord.js')
const {embedMessage} = require("../utils/Utils");
const {EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require("discord.js");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('shop')
        .setDescription('Xem các sản phẩm trong shop'),
    admin: true,
    async execute(interaction) {
        const user = interaction.user;
        let credit = await main.getDatabase().getCredit(user.id);
        if (!credit) {
            credit = 0;
        }
        const products = await main.getDatabase().getProducts();
        let description =
            `Bạn đang có **${credit}** <:vvcl:1135935565301305374>!\n\nVui lòng chọn sản phẩm bên dưới`;
        const selectionMenu = new StringSelectMenuBuilder()
            .setCustomId("shop")
            .setPlaceholder("Chọn sản phẩm")
        const embed1 = new EmbedBuilder()
            .setImage("https://cdn.discordapp.com/attachments/1131819719092097155/1135950173093244928/SHOPCREDIT.png");
        const embed = new EmbedBuilder()
            .setDescription(
                "<:Empty:1132262546049597441>\n" +
                "<:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015> **CỬA HÀNG CREDIT** <:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015>\n" +
                "\n" +
                "<:dot:1132267544418472048>Chào mừng đến với **Cửa Hàng **<:vvcl:1135935565301305374> nơi mà bạn có thể tiêu xài số ****<:vvcl:1135935565301305374> mà bạn đã kiếm được khi sử dụng room voice của chúng tôi. Rất cảm ơn các bạn đã ủng hộ **Valorant Vietnam Community**. \n" +
                "<:Empty:1132262546049597441>\n" +
                "<:dot:1132267544418472048>Để cảm ơn. **VPT MEDIA** đã hỗ trợ những vật phẩm có giá trị cực kỳ cao. **Cửa Hàng Credit** sẽ được làm mới vào ngày **5** hàng tháng*.\n" +
                "<:Empty:1132262546049597441>\n" +
                "<:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015> **VẬT PHẨM TRONG CỬA HÀNG** <:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015>\n" +
                "<:dot:1132267544418472048>Các vật phẩm dưới đây đều được tài trợ 100% bởi [**VPT MEDIA**](https://www.facebook.com/vptstudio).\n" +
                "<:Empty:1132262546049597441>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:dot:1132267544418472048>Discord Nitro: **6.000 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 52 VP: **500 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 110 VP: **1.000 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 275 VP: **2.500 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 610 VP: **5.000 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 3040 VP: **25.000 **<:vvcl:1135935565301305374>\n" +
                "> <:Empty:1132262546049597441><:SubGreen:1132931539261468833> <:Valorant_Points:1135936345580253245> 6550 VP: **50.000 **<:vvcl:1135935565301305374>\n" +
                "\n" +
                "<:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015><:line_green:1132266063929811015>"
            )
            .setColor(Math.floor(Math.random() * 16777215))
            .setFooter({
                text: "Vui lòng làm kỹ theo hướng dẫn. Bạn có thể quay màn hình hoặc chụp từng bước lại để đối chứng khi xảy ra lỗi.",
                iconURL: "https://static.vecteezy.com/system/resources/previews/012/042/292/original/warning-sign-icon-transparent-background-free-png.png"
            })
        const selects = [];
        if (products.length === 0) {
            return await interaction.reply({
                embeds: [embedMessage(`Không có sản phẩm nào trong shop!`)]
            });
        }
        for (const product of products) {
            const selection = new StringSelectMenuOptionBuilder()
                .setLabel(`${product.name}`)
                .setValue(`${product.id}`)
                .setDescription(`${product.description}`)
                .setEmoji({
                    id: product.emoji,
                });
            selects.push(selection);
        }
        selectionMenu.addOptions(selects);
        const row = new ActionRowBuilder()
            .addComponents(selectionMenu);
        await interaction.channel.send({
            embeds: [embed1, embed],
            components: [row]
        });
    }
}
