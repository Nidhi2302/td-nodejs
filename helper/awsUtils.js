const AWS = require('aws-sdk');
let utils = require('./utils.js');
AWS.config.update(config.AWS);
let SES_CONFIG = _.extend(AWS, { apiVersion: '2010-12-01' });
let ses = new AWS.SES(SES_CONFIG);
let sns = new AWS.SNS();
const awsUtils = {}

awsUtils.sendOTP = (params, callback) => {
  sns.publish(params, function (err, data) {
    callback(err, data)
  })
}
awsUtils.sendEmail = (email, uName, fileName, link, subject, callback) => {
  let resetpwd = "./mail-content/" + fileName + ".html";
  utils.getHtmlContent(resetpwd, function (err, content) {
    //console.log("content", content);
    content = content.replace("{USRNAME}", uName);
    content = content.replace("{LINK}", link);

    var to = email;
    // this must relate to a verified SES account
    var from = "no-reply@need-to-park.com"; //need to change
    // this sends the email
    // @todo - add HTML version
    ses.sendEmail({
      Source: "Need-To-Park <" + from + ">", //need to change
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: content,
          }
        }
      }
    }, function (error, data) {
      console.log(error);
      console.log(data);
      if (error) {
        isEmailSent = false;
      } else {
        isEmailSent = true;
      }
      callback(error, isEmailSent);
    });
  });

}
awsUtils.simpleEmail = (email, uName,content, subject, callback) => {
 
    var from = "no-reply@need-to-park.com"; //need to change
    // this sends the email
    // @todo - add HTML version
    ses.sendEmail({
      Source: "Need-to-Park <" + from + ">", //need to change
      Destination: { ToAddresses: [email] },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: content,
          }
        }
      }
    }, function (error, data) {
      console.log(error);
      console.log(data);
      if (error) {
        isEmailSent = false;
      } else {
        isEmailSent = true;
      }
      callback(error, isEmailSent);
    });
 

}
module.exports = awsUtils;