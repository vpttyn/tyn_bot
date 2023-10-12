const Discord = require('discord.js')
const {embedMessage, getRankIcon} = require("../utils/Utils");
const {login, login2FA, loginWithCookie} = require("../utils/Auth");
const {isReadyLink} = require("../storage/UserStorage");

/**
 * @param {Discord.Message} message
 * @type {{data: Discord.SlashCommandBuilder, execute(*): Promise<void>}}
 */
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('lienket')
        .setDescription('Liên kết với tài khoản valorant')
        .addSubcommand(subcommand => subcommand
            .setName('default')
            .setDescription(`Đăng nhập với tài khoản/mật khẩu`)
            .addStringOption(option => option
                .setName("username")
                .setDescription("Username")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("password")
                .setDescription("Password")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('cookie')
            .setDescription(`Đăng nhập với cookie`)
            .addStringOption(option => option
                .setName('cookie')
                .setDescription('Cookie tài khoản')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand()
        const user = interaction.user;
        await interaction.deferReply({
            ephemeral: true
        })
        if (subCommand === 'default') {
            const username = interaction.options.getString("username");
            const password = interaction.options.getString("password");
            const channel = interaction.channel;
            const authInfo = await login(user.id, username, password);
            const readyLink = await isReadyLink(username);
            if (readyLink) {
                await interaction.editReply({
                    embeds: [embedMessage(`Tài khoản ${username} đã được liên kết!`)]
                });
                return;
            }
            if (!authInfo.success) {
                await interaction.editReply({
                    embeds: [embedMessage(`Đăng nhập thất bại!`)]
                });
                return;
            }
            if (authInfo.mfa) {
                const filter = m => m.author.id === user.id;
                const collector = channel.createMessageCollector({
                    filter,
                    time: 60000,
                    max: 1
                });
                await interaction.editReply({
                    embeds: [embedMessage(`Vui lòng nhập mã xác thực 2 lớp!`)]
                });
                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        await interaction.editReply({
                            embeds: [embedMessage(`Hết thời gian!`)]
                        });
                        return;
                    }
                    const mfaCode = collected.first().content;
                    const authInfo = await login2FA(user.id, mfaCode);
                    if (!authInfo.success) {
                        await interaction.editReply({
                            embeds: [embedMessage(`Đăng nhập thất bại!`)]
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [embedMessage(`Đăng nhập thành công!`)]
                        });
                    }
                })
            } else {
                await interaction.editReply({
                    embeds: [embedMessage(`Đăng nhập thành công!`)]
                });
            }
        }
        if (subCommand === 'cookie') {
            const cookie = interaction.options.getString("cookie");
            const authInfo = await loginWithCookie(user.id, cookie);
            if (!authInfo.success) {
                await interaction.editReply({
                    embeds: [embedMessage(`Đăng nhập thất bại!`)]
                });
                return;
            }
            await interaction.editReply({
                embeds: [embedMessage(`Đăng nhập thành công!`)]
            });
        }
    }
}