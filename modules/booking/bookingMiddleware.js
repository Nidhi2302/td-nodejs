let _v = require('../../helper/validate.js');
let utils = require('../../helper/utils.js');
let bookingValidator = require('./bookingValidator.js');
let bookingMiddleware = {};

bookingMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var bookingValidators = {};
            var validators = bookingValidator.getBookingValidator(req,type);
            bookingValidators = validators
            var error = _v.validate(req.body, bookingValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = bookingMiddleware;

