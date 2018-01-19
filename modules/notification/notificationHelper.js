let jwt = require('../../helper/jwt');
let mongoose = require('mongoose');
let usersModel = require('../user/userModel.js');
let bookingModel = require('../booking/bookingModel.js');
let awsUtils = require('../../helper/awsUtils.js');
let utils = require('../../helper/utils.js');
let notificationModel = require('./notificationModel.js');
let Q = require('q');
let notificationHelper = {};

notificationHelper.sendNotifications =  (notificationData, callback) => {
    /**
     * notificationData.notificationType = ['Admin', 'Payment', 'Booking', 'Listing']
     * notificationData.receiversType = ['All', 'IndividualDrivers', 'Managers', 'EnterpriseDrivers', 'AdminPayment', 'AutoPayment', 'BookingUsers']
     * notificationData.notificationTitle = "String"
     * notificationData.notificationMessage = "String"
     */
    //console.log(notificationData);
    notificationData.createdAt = new Date();

    if (notificationData.notificationType == 'Admin') {
        notificationData.type = "Admin";
        if (notificationData.receiversType.indexOf('AdminPayment') != -1) {

        } else {
            let condition = []
            if (notificationData.receiversType.indexOf('IndividualDrivers') != -1) {
                condition.push({ "userType": "Individual" , "notification": true})
            }
            if (notificationData.receiversType.indexOf('Managers') != -1) {
                //send notifications to Managers
                condition.push({ "userType": "Enterprise", "notification": true })

            }
            if (notificationData.receiversType.indexOf('EnterpriseDrivers') != -1) {
                condition.push({ "userType": "Individual", "enterpriseId": { $ne: null }, "notification": true })
            }
            if (notificationData.receiversType.indexOf('All') != -1) {
                condition = [];
                condition.push({ "userType": "Individual", "notification": true })
                condition.push({ "userType": "Enterprise", "notification": true })
                condition.push({ "userType": "Individual", "enterpriseId": { $ne: null }, "notification": true })
                //send Notification to all users.                
            }
            notificationHelper.getAllUser({ $or: condition }, (err, result) => {
                if (!err && result.length > 0) {
                    notificationHelper.storeNotification(notificationData, result, (err1, result1) => {
                        callback(err1, result1)
                    })
                }else{
                    callback(err, result)
                }
            })
        }

    } else if (notificationData.notificationType == 'Booking') {
        //booking user get notify before 30 min
        notificationData.type = "Booking";
        notificationHelper.getAllBookingUser((err, result) => {
            if (!err && result.length > 0) {
                notificationHelper.storeNotification(notificationData, result, (err1, result1) => {
                    callback(err1, result1)
                })
            }else{
                callback(err, result)
            }
        })
    } else if (notificationData.notificationType == 'Listing') {
        //listing user get notify before 10 min
        notificationData.type = "Listing";
        notificationHelper.getAllListingUser((err, result) => {
            if (!err && result.length > 0) {
                notificationHelper.storeNotification(notificationData, result, (err1, result1) => {
                    callback(err1, result1)
                })
            }else{
                callback(err, result)
            }
        })
    } else if (notificationData.notificationType == 'Payment') {
        //send Notification to all users whose expiryDate today.
    }


}

notificationHelper.getAllUser =  (condition, callback) => {
     usersModel.find(condition, { _id: 1, notificationType: 1, email: 1, phoneNumber: 1 }).exec((err, result) => { callback(err, result) })
}

notificationHelper.getAllBookingUser = (callback) => {
    bookingModel.aggregate([
        {
            $lookup: {
                from: 'listings',
                localField: 'listingId',
                foreignField: 'listingId',
                as: 'listingData'
            }
        }, {
            $unwind: {
                path: "$listingData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'listedUserId',
                foreignField: '_id',
                as: 'userData'
            }
        }, {
            $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$_id",
                available: { $first: "$listingData.available" },
                bookedUserId: { $first: "$bookedUserId" },
                email:{$first:"$userData.email"},
                number:{$first:"$userData.phoneNumber"},
                notificationType:{$first:"$userData.notificationType"}
            }
        }
    ], (err, result) => {
        let userList = []
        let currentTime = new Date();
        //console.log("booking",Math.abs(Math.round((currentTime.getTime() - result[0].available.getTime()) / 60000)))
        result.map((record) => {
           
            let diff = Math.abs(Math.round((currentTime.getTime() - record.available.getTime()) / 60000))
            if (diff == 30) {
                userList.push({
                     _id: record.bookedUserId,
                     email:record.email,
                     phoneNumber:record.number,
                     notificationType:record.notificationType });
            }
        })
       //console.log(userList)
        callback(err, userList)
    })
}

notificationHelper.getAllListingUser = (callback) => {
    bookingModel.aggregate([
        {
            $lookup: {
                from: 'listings',
                localField: 'listingId',
                foreignField: 'listingId',
                as: 'listingData'
            }
        }, {
            $unwind: {
                path: "$listingData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'listedUserId',
                foreignField: '_id',
                as: 'userData'
            }
        }, {
            $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: "$_id",
                available: { $first: "$listingData.available" },
                listedUserId: { $first: "$listedUserId" },
                email:{$first:"$userData.email"},
                number:{$first:"$userData.phoneNumber"},
                notificationType:{$first:"$userData.notificationType"}
            }
        }
    ], (err, result) => {
        let userList = []
        let currentTime = new Date();
        //console.log("listing",result[0])
        result.map((record) => {
            
            let diff = Math.abs(Math.round((currentTime.getTime() - record.available.getTime()) / 60000))
            if (diff == 10) {
                userList.push({ _id: record.listedUserId,
                    email:record.email,
                    phoneNumber:record.number,
                    notificationType:record.notificationType  });
            }
        })
        //console.log(userList)
        callback(err, userList)
    })
}

notificationHelper.storeNotification = (Data, users, callback) => {

    let usersList = [];
    let notifications = [];
    _.each(users, (user, index) => {
        let notifyRecord = {
            notificationMessage: Data.notificationMessage,
            type: Data.type,
            notificationType: user.notificationType,
            userId: user._id,
            userEmail: user.email,
            userNumber: user.phoneNumber.replace(/\D+/g, ''),
            createdAt: new Date()
        }
        notifications.push(notifyRecord);
        usersList.push(mongoose.Types.ObjectId(user._id));

    });
    console.log(notifications);
    //set notification type[Only SMS, Only Email,Both]

    notificationModel.insertMany(notifications, (notificationErr, notificationResult) => {
        if (!notificationErr) {
            notificationHelper.updateBadgeCount(usersList, (badgeErr, badgeResult) => {
                console.log(badgeErr, badgeResult)
            })
            callback(notificationErr, notificationResult);
        } else {
            callback(notificationErr, null);
        }

    });
}

notificationHelper.updateBadgeCount =  (userList, callback) => {
    usersModel.update({ _id: { $in: userList } }, { $inc: { badgeCount: +1 } }, { multi: true }).exec((err, result) => {
        callback(err, result);
    })
}

notificationHelper.markRead =  (condition, callback) => {
    usersModel.update(condition, { badgeCount: 0 }).exec((err, result) => {
        callback(err, result);
    });
}

notificationHelper.getUserNotifications =  (userId, callback) => {
    console.log(userId);
    notificationModel.find({"userId":mongoose.Types.ObjectId(userId),"sent":true}).sort( { "createdAt": -1 } ).exec((err, result) => {
        callback(err, result);
    })
}

notificationHelper.sendNotificationCron = () => {
    //console.log("inside notification cron")
    notificationModel.find({ "sent": false }).limit(1).exec((err, record) => {
        if (record) {
            if (record.length == 1 && !err) {
                //console.log(err, record[0], record.length)
                record=record[0];
                if (record.notificationType == "Only SMS" || record.notificationType == "SMS & Email") {
                    //send SMS
                    console.log("SMS")
                    let params = {
                        Message: record.notificationMessage,
                        MessageStructure: 'string',
                        PhoneNumber: process.env.COUNTRYCODE + parseInt(record.userNumber)
                    };
                    console.log(params)
                    awsUtils.sendOTP(params, function (err1, data) {
                        console.log(err1, data);
                        if (!err1) {
                            //update notification record
                            notificationModel.update({ _id: record._id }, { sent: true }, (err2, data2) => { })
                        }
                    });
                }
                if (record.notificationType == "Only Email" || record.notificationType == "SMS & Email") {
                    //send Email
                    console.log("Email")
                    let notificationTemplate = "./mail-content/notification.html";
                    utils.getHtmlContent(notificationTemplate, function (errEmail, content) {
                        content = content.replace("{MSG}", record.notificationMessage);
                        awsUtils.simpleEmail(record.userEmail, "", content, "Need-to-Park", function (error, passResult) {
                            //update notification record
                            notificationModel.update({ _id: record._id }, { sent: true }, (err2, data2) => { })
                        })
                    });
                }
            }
        }
    })
}

notificationHelper.listingNotification=()=>{
    let notify={
        notificationMessage:"Please vacate the space in 10 Minutes. Booking driver is arriving",
        notificationType:"Listing"
    }
   // console.log("listing cron run in every min")
    notificationHelper.sendNotifications(notify,(err,result)=>{
        //running in cron do nothing
    })
}

notificationHelper.bookingNotification=()=>{
    let notify={
        notificationMessage:"Your booked space will be available in 30 Minutes.",
        notificationType:"Booking"
    }
    //console.log("booking cron run in every min")
    notificationHelper.sendNotifications(notify,(err,result)=>{
        //running in cron do nothing
    })
}

module.exports = notificationHelper;

