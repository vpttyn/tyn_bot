module.exports = {
    name: 'ReduceUserCredit',
    method: 'POST',
    pathName: 'REDUCE_USER_CREDIT',
    run: async function (req, res) {
        const { discordId, amount, reason } = req.body;
        if (!discordId || !amount || !reason) {
            return res.status(400).json({
                message: 'Bad request.',
                status: 400
            });
        }
        await main.getDatabase().removeCredit(discordId, amount, reason)
        return res.status(200).json({
            message: 'Success.',
            status: 200
        });
    }
};