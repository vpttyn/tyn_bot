const { randomInt } = require("./StringUtils");

const getWelcomeCredit = async (member) => {
    let credits = 0;
    for (let roleId in config.welcomeCredit) {
        const roleInfo = config.welcomeCredit[roleId];
        if (roleId == 'DEFAULT') {
            credits += randomInt(roleInfo);
        }
        const role = await member.guild.roles.fetch(roleId);
        if (role) {
            if (member.roles.cache.has(role.id)) {
                credits += randomInt(roleInfo);
            }
        }
    }
    return credits;
}

module.exports = {
    getWelcomeCredit
}