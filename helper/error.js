let utils = require('../helper/utils.js');
let error = {};
error.notFound = (res,req) => {
    res.status(404).json(req.t("INVALID_REQUEST"));
}
error.notAuthenticated = (res,req,data) => {
    var response = {};
        if (!utils.empty(data) && _.isObject(data)) {
            for (var key in data) {
                response[key] = data[key];
            }
        } else {
            response["message"] = req.t("NOT_AUTHORIZED");
        }
    res.status(401).json(response);
}
error.validationError = (res, message) => {
     res.status(400).json(message);
}
module.exports = error;