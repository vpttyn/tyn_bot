const Authenticator = (req, res, next) => {
    const authHeader = req.header('Authorization');
    let apiKey = null;
    if (authHeader) {
        apiKey = authHeader.substring(7);
    }
    if (
        !authHeader ||
        !authHeader.startsWith('Bearer ') ||
        apiKey !== '7xrZ[vyK~7;us_@k'
    ) {
        return res.status(401).json({
            message: 'Unauthorized.',
            status: 401
        });
    }
    next();
};

/**
 * @param req
 *
 * @type {(function(*, *, *): (*|undefined))|*}
 */
module.exports = {
    Authenticator
};