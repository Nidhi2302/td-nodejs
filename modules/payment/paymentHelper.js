let StripeUtility = require('../../helper/stripeUtils');
let jwt = require('../../helper/jwt');
let mongoose = require('mongoose');
let usersModel = require('../user/userModel.js');
let paymentModel = require('../payment/paymentModel.js');
let userCtr = require('../user/userController.js');
let paymentHelper = {}

paymentHelper.subscribeuser = (token, plan, email, callback) => {
    StripeUtility.createCustomerWithCard(email, null, token).then(function (customer) {
        let stripeCustomerId = customer.id;
        StripeUtility.createSubscription(stripeCustomerId, email, plan).then(function (subscription) {
            console.log();
            let expiryDate = new Date(subscription.current_period_end * 1000)
            let fields = {
                amount: subscription.plan.amount,
                currency: subscription.plan.currency,
                customerId: subscription.customer,
                subscriptionId: subscription.id,
                subscriptionPlan: plan,
                stripeCustomerId: stripeCustomerId,
                expiryDate: expiryDate
            }
            callback(fields);
        }, function (err) {
            console.log("err in payment module", err)
            callback(null);
        });

    }, function (err) {
        console.log("err in payment module", err)
        callback(null);
    });
}
paymentHelper.storePaymentDetail = (details, callback) => {
    let subscriptions = new paymentModel(details);
    subscriptions.save((err1, response1) => {
        callback(err1, response1);
    });
}

paymentHelper.getTotalCollection = (callback) => {
    paymentModel.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'userDetail'
            }
        },
        {
            $unwind: {
                path: "$userDetail",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group:
                {
                    _id: "$_id",
                    "totalAmount": { $sum: { $multiply: ["$amount", 0.01] } },
                    "userType": { "$first": "$userDetail.userType" }
                }
        }
    ]).exec((err, result) => {
        let responseData = {
            individual: 0,
            enterprise: 0,
            totalAmount: 0
        };

        _.forEach(result, (res) => {
            if (res.userType == 'Individual') {
                responseData.individual = responseData.individual + res.totalAmount;
                responseData.totalAmount = responseData.totalAmount + res.totalAmount;
            } else if (res.userType == 'Enterprise') {
                responseData.enterprise = responseData.enterprise + res.totalAmount;
                responseData.totalAmount = responseData.totalAmount + res.totalAmount;
            }
        });

        callback(err, responseData);
    })
}

paymentHelper.getTotalCollectionByUser = (userId, callback) => {
    usersModel.aggregate([
        {
            $match: {
                "_id": mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'user_id',
                as: 'paymentDetail'
            }
        },
        {
            $unwind: {
                path: "$paymentDetail",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group:
                {
                    _id: "$_id",
                    firstname: { "$first": "$firstname" },
                    paymentData: { $push: { amount: { $multiply: ["$paymentDetail.amount", 0.01] }, date: "$paymentDetail.created" } }
                }
        }
    ]).exec((err, result) => {
        callback(err, result[0]);
    })
}
module.exports = paymentHelper; 