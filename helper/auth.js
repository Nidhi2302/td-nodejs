let utils = require('../helper/utils.js');
let auth = {};
auth.checkToken = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
        if (utils.empty(token)) {
            token = (req.body && req.body['x-auth-token']);
        }
        if (utils.empty(token)) {
            return errorUtil.notAuthenticated(res, req);
        }
        req.token = token;
        next();
}
module.exports = auth