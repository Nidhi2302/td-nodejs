let apns = require("apn");
let utils = require('../helper/utils.js');
let notificationUtil ={};
notificationUtil.getNotificationType = (type) => {
    if( typeof type === "undefined" )
            type = "DEFAULT";
        var types = {
            "DEFAULT": 1,
            "CHAT": 2,
            "BUDDY": 3
        }
        return types[type];
    
}
notificationUtil.sendNotification = (data, deviceToken, success, failure) => {
    if (!utils.empty(deviceToken)) {
            let connection = new apns.Provider(config.NOTIFICATION_OPTIONS);
            let notification = notificationUtil.createNotification(data);

            if( !utils.isArray(deviceToken) && utils.isDefined(deviceToken) ){
                deviceToken = [deviceToken];
            }
            if (utils.isArray(deviceToken) && deviceToken.length > 0) {
                connection.send(notification, deviceToken[0])
                    .then((result) => {
                        console.log(result);
                        result.sent.forEach( (token) => {
                            console.log("Notification Sent => ");
                        });
                        result.failed.forEach( (failure) => {
                            // A transport-level error occurred (e.g. network problem)
                            console.log("Notification Failed => ");
                            console.log(failure);
                            console.log("Notification Failed => ");
                            console.log(failure.error);
                        });
                    });
            }
        }
}
/*
* Send notifiction to ios multipal devices (with different message)
*/
notificationUtil.sendManyNotification = (notificationData, callback) => {
    if (!utils.empty(notificationData) && notificationData.length > 0) {
            let connection = new apns.Provider(config.NOTIFICATION_OPTIONS);

            _(notificationData).forEach(function (data) {
                if (!utils.empty(data.deviceToken)) {
                    let notification = notificationUtil.createNotification(data.data);
                    connection.send(notification, deviceToken)
                        .then((result) => {
                            console.log(result);
                            result.sent.forEach( (token) => {
                                console.log("Notification Sent => ");
                                console.log(token);
                            });
                            result.failed.forEach( (failure) => {
                                // A transport-level error occurred (e.g. network problem)
                                console.log("Notification Failed => ");
                                console.log(failure);
                                console.log("Notification Failed => ");
                                console.log(failure.error);
                            });
                        });
                }
            });
            callback(null, true);
        } else {
            callback(null, false);
        }
}
notificationUtil.createNotification = (data) =>{
    let notification = new apns.Notification();
        let payload = {};
        for (var key in data) {
            switch (key) {
                case 'alert':
                    notification.alert = data.alert;
                    break;
                case 'badge':
                    notification.badge = data.badge;
                    break;
                case 'sound':
                    notification.sound = data.sound;
                    break;
                case 'content-available':
                    //notification.setNewsstandAvailable(true);
                    var isAvailable = data['content-available'] === 1;
                    notification.contentAvailable = isAvailable;
                    break;
                case 'category':
                    notification.category = data.category;
                    break;
                default:
                    payload[key] = data[key];
                    break;
            }
        }
        notification.payload = payload;
        notification.expiry = Math.floor(Date.now() / 1000) + 3600;
        return notification;
}
notificationUtil.sendNotificationToDevice = (tokens,req) => {
   let notificationData = {
                "sound": "default", 
                "alert": {
                    "title": req.senderName, 
                    "body": req.message
                }
            };
    if(!utils.empty(tokens) ){
        console.log(notificationData,tokens);
        notificationUtil.sendNotification(notificationData, tokens);
    }else{
        console.log("Notification Failure => Devie token not found");
    } 
}

module.exports = notificationUtil