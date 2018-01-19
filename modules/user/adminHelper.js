let adminModel = require('./adminModel.js');
let utils = require('../../helper/utils');
let mongoose = require('mongoose');
let adminHelper = {};

adminHelper.adminRegistration = (admin, callback) => {
  let saveAdmin = new adminModel(admin)
  saveAdmin.save((err, result) => {
    callback(err, result);
  });
}

/* This function return only admindetail and secrete token*/
adminHelper.getAdminDetail = (condition, field, callback) => {
  adminModel.find(condition, field,
    function(err, result) {
      callback(err, result);
    });
}

module.exports = adminHelper;