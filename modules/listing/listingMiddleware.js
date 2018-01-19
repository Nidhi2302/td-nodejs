let _v = require('../../helper/validate.js');
let utils = require('../../helper/utils.js');
let listingValidator = require('./listingValidator.js');
let listingMiddleware = {};

listingMiddleware.validateInput = (type, validateType) => {
    return function(req, res, next) {
      var listingValidators = {};
      var validators = listingValidator.getlistingValidator(req, type);
      listingValidators = validators
      var error = _v.validate(req.body, listingValidators);
      if (!utils.empty(error)) {
        return errorUtil.validationError(res, error);
      }
      next();
    };
  },
  module.exports = listingMiddleware;