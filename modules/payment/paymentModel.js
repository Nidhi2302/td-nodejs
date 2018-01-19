let mongoose = require('mongoose');

let userSubscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    amount : {
        type : Number,
    },
    currency : {
        type : String
    },
    subscriptionId : {
        type : String
    },
    stripeCustomerId:{
        type : String,
    },
    subscriptionPlan:{
        type : String,
    },
   
    customerId : {
        type : String
    },
    expiryDate: {
        type: Date
    },
    created: {
        type: Date,
        default : new Date()
    },
    isCancelSubscription : {
        type : Boolean,
        default : false
    },
    autoRenewalObj:{
        type:Object
    }
});

let userSubscription = mongoose.model('payment', userSubscriptionSchema);
module.exports = userSubscription;