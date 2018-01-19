let mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({

    notificationMessage: {
        type: String
    },
    notificationType: {
        type: String,
    },
    type: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    userEmail:{
        type:String
    },
    userNumber:{
        type:Number
    },
    sent:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

let notifications = mongoose.model('notifications', notificationSchema);
module.exports = notifications;