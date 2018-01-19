let fs = require('fs');
let StripeUtility = require('../../helper/stripeUtils');
let jwt = require('../../helper/jwt');
let mongoose = require('mongoose');
let notificationHelper = require('./notificationHelper.js');
let userHelper = require('../user/userHelper.js');
let utils = require('../../helper/utils.js');
var notificationCtrl = {};
notificationCtrl.sendNotification = (req, res) => {
    let notificationData = {};
    //console.log(req.body);
    notificationData.notificationType = 'Admin';
    notificationData.receiversType = req.body.receiversTypes;
    notificationData.notificationMessage = req.body.notificationMessage;

    notificationHelper.sendNotifications(notificationData, (err, result) => {
        console.log(err);
        if (!err || result.length == 0) {
            res.status(200).json(req.t("NOTIFICATION_SENT"));
        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }
    });
}

notificationCtrl.markRead = (req, res) => {
    let userId = jwt.getUserId(req.headers["x-auth-token"]);

    notificationHelper.markRead({ _id: userId }, (err, result) => {
        if (!err) {
            res.status(200).json(req.t("BADGE_COUNT_UPDATED"));
        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }
    });
}

notificationCtrl.getUserNotifications = (req, res) => {
    let userId = jwt.getUserId(req.headers["x-auth-token"]);
    notificationHelper.getUserNotifications(userId, (err, result) => {
        if (!err) {
            res.status(200).json(result);
        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }
    })
}

notificationCtrl.getBadgeCount = (req, res) => {
    let userId = jwt.getUserId(req.headers["x-auth-token"]);
    userHelper.getUserDetail({_id:mongoose.Types.ObjectId(userId)},{"badgeCount":1},(err,result)=>{
        if (!err) {
            res.status(200).json(result[0]);
        } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
        }
    })
}


module.exports = notificationCtrl; 
