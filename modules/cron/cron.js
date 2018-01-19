var CronJob = require('cron').CronJob;

// Every minute.
var CronSendEmail = require('../user/userController.js');
var CronSendNotification = require('../notification/notificationHelper.js');
var CronExpireSpace = require('../listing/listingHelper.js');

new CronJob('*/5 * * * * *', function() {
    CronSendEmail.sendEmailCron();
}, null, true, 'America/New_York');

new CronJob('*/5 * * * * *', function() {
    CronSendNotification.sendNotificationCron();
}, null, true, 'America/New_York');

new CronJob('*/60 * * * * *', function() {
    CronSendNotification.listingNotification();
}, null, true, 'America/New_York');

new CronJob('*/60 * * * * *', function() {
    CronExpireSpace.expireListedSpace();
}, null, true, 'America/New_York');

new CronJob('*/60 * * * * *', function() {
    CronSendNotification.bookingNotification();
}, null, true, 'America/New_York');