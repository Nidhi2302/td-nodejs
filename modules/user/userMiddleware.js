let _v = require('../../helper/validate.js');
let utils = require('../../helper/utils.js');
let userValidator = require('./userValidator.js');
let userMiddleware = {};

userMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var userValidators = {};
            var validators = userValidator.getuserValidator(req,type);
            userValidators = validators
            var error = _v.validate(req.body, userValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = userMiddleware;

