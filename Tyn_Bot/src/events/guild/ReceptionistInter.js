const Discord = require('discord.js');
const { embedMessage } = require('../../utils/Utils');
const { getWelcomeCredit } = require('../../utils/Calculator');

module.exports = {
    name: Discord.Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.type === Discord.ChannelType.DM) return;
        const content = message.content.toLowerCase();
        const keywords = [
            'xin chào',
            'hello',
            'chào mừng'
        ];
        for (let keyword of keywords) {
            if (content.includes(keyword.toLowerCase())) {
                const tag = message.mentions.users.first();
                if (!tag) return;
                const isExists = main.getClient().queues.find(value => value.id === tag.id);
                if (isExists.length <= 0) return; // not exists
                if (isExists.users.includes(message.author.id)) return;
                if (isExists.users.length >= 4) {
                    main.getClient().queues = main.getClient().queues.filter(value => value.id != tag.id)
                }
                isExists.users.push(message.author.id);
                const creditsReceived = await getWelcomeCredit(message.member);
                await main.getDatabase().addCredit(message.author.id, creditsReceived, false, `Tiếp đón ${tag.username}`);
                await message.author.send({
                    embeds: [embedMessage(`Bạn đã nhận được ${creditsReceived} <:vvcl:1135935565301305374> vì đã tiếp đón ${tag}`)]
                })
            }
        }
    }
}