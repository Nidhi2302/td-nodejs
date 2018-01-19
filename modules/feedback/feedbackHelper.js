
let mongoose = require('mongoose');
let feedbackModel = require('../feedback/feedbackModel.js');
let awsUtils = require('../../helper/awsUtils.js');
let utils = require('../../helper/utils.js');
let feedbackHelper = {}

feedbackHelper.storeFeedback = (params, cb) => {
    let feedback= new feedbackModel(params);
    feedback.save((err,result)=>{
        let notificationTemplate = "./mail-content/feedback.html";
        utils.getHtmlContent(notificationTemplate, function (errEmail, content) {
            let msg="Name:"+params.name+"<br>Email:"+params.email+"<br>PhoneNumber:"+params.phoneNumber+"<br>Organization:"+params.organization+"<br>Message:"+params.message;
            content = content.replace("{MSG}", msg);
            awsUtils.simpleEmail("nidhi.joshi.sa@gmail.com", "", content, "Need-to-Park", function (error, passResult) {
                cb(err,result)
            })
        });
      
    })
}

feedbackHelper.getFeedback = (cb) => {
    feedbackModel.find((err,result)=>{
        cb(err,result)
    })
}

module.exports = feedbackHelper; 