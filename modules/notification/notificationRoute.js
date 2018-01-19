//Dependencies 
let express = require('express');
let notificationCtrl = require('./notificationController.js');
let auth = require("../../helper/auth");
let notificationRouter = express.Router();

let sendNotification = [auth.checkToken, notificationCtrl.sendNotification];
notificationRouter.post('/send-notification', sendNotification);

let markRead = [auth.checkToken, notificationCtrl.markRead];
notificationRouter.get('/mark-read', markRead);

let getUserNotifications = [auth.checkToken, notificationCtrl.getUserNotifications];
notificationRouter.get('/get-user-notifications', getUserNotifications);


let getBadgeCount = [auth.checkToken, notificationCtrl.getBadgeCount];
notificationRouter.get('/get-badgeCount', getBadgeCount);

module.exports = notificationRouter;
