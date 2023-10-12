const {EmbedBuilder} = require("discord.js");

const embedMessage = (description) => {
    return new EmbedBuilder()
        .setDescription(description)
        .setColor(Math.floor(Math.random() * 16777215));
}

const getRankIcon = (rank) => {
    const rankIcon = {
        "iron": "https://i.imgur.com/PsD5BfU.png",
        "bronze": "https://i.imgur.com/2Y2A9xf.png",
        "silver": "https://i.imgur.com/ABSTx2m.png",
        "gold": "https://i.imgur.com/sTn32ft.png",
        "platinum": "https://i.imgur.com/It6bMJl.png",
        "diamond": "https://i.imgur.com/dnkLWqG.png",
        "ascendant": "https://i.imgur.com/qVUXpPR.png",
        "immortal": "https://i.imgur.com/yQNGKD8.png",
        "radiant": "https://i.imgur.com/nIqTPso.png"
    }
    return rankIcon[rank];
}

const getRankName = (rank) => {
    const rankName = {
        "iron": "Sắt",
        "bronze": "Đồng",
        "silver": "Bạc",
        "gold": "Vàng",
        "platinum": "Bạch Kim",
        "diamond": "Kim Cương",
        "ascendant": "Thách Đấu",
        "immortal": "Vô Địch",
        "radiant": "Huyền Thoại"
    }
    return rankName[rank];
}

const decodeToken = (token) => {
    const encodedPayload = token.split('.')[1];
    return JSON.parse(atob(encodedPayload));
}
const parseSetCookie = (setCookie) => {
    if (!setCookie) {
        console.error("Riot didn't return any cookies during the auth request! Cloudflare might have something to do with it...");
        return {};
    }

    const cookies = {};
    for (const cookie of setCookie) {
        const sep = cookie.indexOf("=");
        cookies[cookie.slice(0, sep)] = cookie.slice(sep + 1, cookie.indexOf(';'));
    }
    return cookies;
}

const stringifyCookies = (cookies) => {
    const cookieList = [];
    for (let [key, value] of Object.entries(cookies)) {
        cookieList.push(key + "=" + value);
    }
    return cookieList.join("; ");
}

const extractTokensFromUri = (uri) => {
    const match = uri.match(/access_token=((?:[a-zA-Z]|\d|\.|-|_)*).*id_token=((?:[a-zA-Z]|\d|\.|-|_)*).*expires_in=(\d*)/);
    if (!match) return [null, null];

    const [, accessToken, idToken] = match;
    return [accessToken, idToken]
}

const getFirstIndex = (string) => {
    const json = JSON.parse(string);
    return json[0];
}
const addItemToString = (string, item) => {
    const json = JSON.parse(string);
    json.push(item);
    return JSON.stringify(json);
}

const removeItemFromString = (string, item) => {
    const json = JSON.parse(string);
    const index = json.indexOf(item);
    if (index > -1) {
        json.splice(index, 1);
    }
    return JSON.stringify(json);
}

const countItemsInString = (string) => {
    const json = JSON.parse(string);
    return json.length;
}

const log = async (message) => {
    const channel = await main.getClient().channels.fetch(config.logChannel);
    if (channel) {
        channel.send({
            embeds: [embedMessage(message)]
        });
    }
}


module.exports = {
    embedMessage,
    getRankIcon,
    decodeToken,
    parseSetCookie,
    stringifyCookies,
    extractTokensFromUri,
    getFirstIndex,
    addItemToString,
    removeItemFromString,
    countItemsInString,
    log,
    getRankName
}