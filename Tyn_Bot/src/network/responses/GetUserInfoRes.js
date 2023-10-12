const {getUser} = require("../../storage/UserStorage");
const {getUseInfo, refeshToken} = require("../../utils/Auth");

/**
 * @param req
 * @param res
 * @returns {Promise<*>}
 * @type {{pathName: string, method: string, name: string, run: ((function(*, *): Promise<*>)|*)}}
 */
module.exports = {
    name: 'GetUserInfoRes',
    method: 'GET',
    pathName: 'GET_INFO',
    run: async function (req, res) {
        const { discordId } = req.params;
        if (!discordId) {
            return res.status(400).json({
                message: 'Bad request.',
                status: 400
            });
        }
        const user = await getUser(discordId);
        await refeshToken(discordId);
        const userInfo = await getUseInfo(user.auth.rso);
        if (!user || !userInfo) {
            return res.status(400).json({
                message: 'User not found.',
                status: 505
            });
        }
        return res.status(200).json({
            message: 'Success.',
            status: 200,
            data: {
                username: userInfo.username.split('#')[0],
                tag: userInfo.username.split('#')[1]
            }
        });
    }
};