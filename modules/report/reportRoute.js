//Dependencies 
let express = require('express');
let reportCtr = require('./reportController.js');
let auth = require("../../helper/auth");
let reportRouter = express.Router();

let reportIssue = [auth.checkToken, reportCtr.reportIssue];
reportRouter.post('/report-issue', reportIssue);

let reportCheckForValid = [auth.checkToken, reportCtr.reportCheckForValid];
reportRouter.post('/report-check-for-valid', reportCheckForValid);

let getFraudBookingsReport = [auth.checkToken, reportCtr.getFraudBookingsReport]
reportRouter.get('/get-fraud-bookings-report', getFraudBookingsReport);

let getFraudListingsReport = [auth.checkToken, reportCtr.getFraudListingsReport]
reportRouter.get('/get-fraud-listings-report', getFraudListingsReport);

let reportDetail = [auth.checkToken, reportCtr.reportDetail];
reportRouter.get('/report-detail/:type/:id', reportDetail);

let blockUser = [auth.checkToken, reportCtr.blockUser];
reportRouter.get('/block-user/:id', blockUser);

let unblockUser = [auth.checkToken, reportCtr.unblockUser];
reportRouter.get('/unblock-user/:id', unblockUser);

module.exports = reportRouter;