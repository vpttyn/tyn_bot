const {getUser} = require("../../storage/UserStorage");
const {getUseInfo, refeshToken} = require("../../utils/Auth");

/**
 * @param req
 * @param res
 * @returns {Promise<*>}
 * @type {{pathName: string, method: string, name: string, run: ((function(*, *): Promise<*>)|*)}}
 */
module.exports = {
    name: 'GetUserCredit',
    method: 'GET',
    pathName: 'GET_USER_CREDIT',
    run: async function (req, res) {
        const { discordId } = req.params;
        if (!discordId) {
            return res.status(400).json({
                message: 'Bad request.',
                status: 400
            });
        }
        let user = await main.getDatabase().getCredit(discordId);
        if (!user) {
            user = 0;
        }
        return res.status(200).json({
            message: 'Success.',
            status: 200,
            data: {
                credit: user
            }
        });
    }
};