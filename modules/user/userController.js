let fs = require('fs');
let userModel = require('./userModel.js');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let awsUtils = require('../../helper/awsUtils.js');
let userHelper = require('./userHelper.js');
let adminHelper = require('./adminHelper.js');
let paymentHelper = require('../payment/paymentHelper.js');
let mongoose = require('mongoose');
let notificationUtil = require('../../helper/notificationUtils.js');
let md5 = require("js-md5");
let userCtr = {};
let xlsx = require('node-xlsx');
let csv = require('csv-parse');
userCtr.login = (req, res) => {
  console.log("Entry in userCtr.login", req.body)
  if (req.body.email.indexOf('admin') == -1) {
    let condition = {
      "$or": [{ 'email': req.body.email.toLowerCase() }, { 'username': req.body.email }],
      "password": md5(req.body.password)
    }
    let field = {
      "email": 1,
      "username": 1,
      "password": 1,
      "cb_radio_handle": 1,
      "firstname": 1,
      "lastname": 1,
      "organization": 1,
      "city": 1,
      "state": 1,
      "userType": 1,
      "phoneNumber": 1,
      "truckType": 1,
      "password": 1,
      "enterpriseId": 1,
      "truckLength": 1,
      "truckNumber": 1,
      "isEmailVerify": 1,
      "isAgreementSign": 1,
      "isBlock":1,
      "badgeCount":1
    }
    userHelper.getUserDetail(condition, field, (err, result) => {
      console.log(err, result[0]);
      if (!utils.isDefined(err) && result[0] != null) {
        // console.log(result[0].isEmailVerify);
        if (result[0].isEmailVerify) {
          if(!result[0].isBlock){
            let secteteToken = jwt.createSecretToken({ uid: result[0]._id });
          let response = {
            secteteToken: secteteToken,
            uData: result
          }
          console.log("Exit from userCtr.login", response)
          res.status(200).json(response);
          }else{
            res.status(400).json(req.t("USER_BLOCKED"));
          }
          
        } else {
          res.status(400).json(req.t("EMAIL_NOT_VERIFIED"));
        }
      } else {
        res.status(400).json(req.t("NOT_VALID_EMAIL_PASSWORD"));
      }
    })
  } else {
    let condition = {
      'email': req.body.email ? req.body.email.toLowerCase() : '',
      "password": md5(req.body.password)
    }
    let field = {
      "email": 1,
      "name": 1,
      "role": 1
    }
    adminHelper.getAdminDetail(condition, field, (err, result) => {
      if (!utils.isDefined(err) && result[0] != null) {
        let secteteToken = jwt.createSecretToken({ uid: result[0]._id });
        let response = {
          secteteToken: secteteToken,
          uData: result
        }
        console.log("Exit from userCtr.login", response)
        res.status(200).json(response);
      } else {
        res.status(400).json(req.t("NOT_VALID_EMAIL_PASSWORD"));
      }
    })
  }
}

/* This function for registration pass two variable table name and  req example req ={name :'example'} */
userCtr.userRegistration = (req, res) => {
  console.log("Entry in userCtr.userRegistration", req.body)
  if (req.body.enterpriseId != undefined) {
    let post = {
      email: req.body.email.toLowerCase(),
      firstname: req.body.firstname,
      lastname:req.body.lastname,
      username: req.body.username ? req.body.username.toLowerCase() : "",
      cb_radio_handle: req.body.cb_radio_handle ? req.body.cb_radio_handle.toLowerCase() : "",
      organization: req.body.organization,
      address:req.body.address,
      city: req.body.city,
      state: req.body.state,
      userType: req.body.userType,
      phoneNumber: req.body.phoneNumber,
      truckType: req.body.truckType ? req.body.truckType : "",
      enterpriseId: mongoose.Types.ObjectId(req.body.enterpriseId),
      truckLength: req.body.truckLength ? req.body.truckLength : "",
      truckNumber: req.body.truckNumber ? req.body.truckNumber : "",
      isActivated: false
    }
    //check count
    userHelper.getUserDetail({ "_id": mongoose.Types.ObjectId(req.body.enterpriseId) }, { "userCount": 1, "plan": 1 }, (errUser, resultUser) => {
      let plan = JSON.parse(process.env.STRIPE_PLAN);
      let planDetail = _.find(plan, ['plan', resultUser[0].plan]);
      if (planDetail.count > resultUser[0].userCount) {
        userHelper.userRegistration(post, (err, result) => {
          // console.log(err, result);
          let secretToken = jwt.createSecretToken({ uid: result._id })
          let data = {
            email: result.email,
            firstname: result.firstname,
            lastname: result.lastname,
            username: result.username,
            cb_radio_handle: result.cb_radio_handle,
            organization: result.organization,
            city: result.city,
            state: result.state,
            userType: result.userType,
            phoneNumber: result.phoneNumber,
            truckType: result.truckType,
            enterpriseId: result.enterpriseId,
            truckLength: result.truckLength,
            truckNumber: result.truckNumber,
            isEmailVerify: result.isEmailVerify,
            isAgreementSign: result.isAgreementSign,
            secretToken: secretToken,
          }
          response = {
            'data': data,
            'message': req.t('SUCCESS')
          }
          if (!utils.isDefined(err)) {
            awsUtils.sendEmail(result.email, result.firstname+" "+result.lastname, "setpassword", config.SITE_URL + "/set-password/" + result._id, "Set Password", function (err2, passResult) {
              if (passResult) {
                console.log("Exit from userCtr.userRegistration", response)
                res.status(200).json(response);

              } else {
                res.status(400).json(req.t("NOT_SENDMAIL"));
              }

            });
            //increment user count
            userModel.update({ _id: mongoose.Types.ObjectId(req.body.enterpriseId) }, { $inc: { userCount: +1 } }).exec((errCount, resultCount) => {
              console.log(errCount, resultCount);
            })
          }
        })
      } else {
        res.status(400).json(req.t("USER_LIMIT_END"));
      }
    })

  } else {
    let plan = req.body.plan
    console.log("plan ======",typeof process.env.PAYMENT_PROD)
    if (process.env.PAYMENT_PROD == 'false' ) {
      plan = "Test_monthly"
    }
    console.log("plan ======",plan)
    paymentHelper.subscribeuser(req.body.token, plan, req.body.email.toLowerCase(), (stripeResult) => {
      // console.log(" password", req.body.password);
      if (stripeResult != null) {
        let post2 = {
          email: req.body.email.toLowerCase(),
          password: req.body.password ? md5(req.body.password) : "",
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username ? req.body.username.toLowerCase() : "",
          cb_radio_handle: req.body.cb_radio_handle ? req.body.cb_radio_handle.toLowerCase() : "",
          organization: req.body.organization,
          address:req.body.address,
          city: req.body.city,
          state: req.body.state,
          userType: req.body.userType,
          phoneNumber: req.body.phoneNumber,
          truckType: req.body.truckType ? req.body.truckType : "",
          enterpriseId: req.body.enterpriseId ? mongoose.Types.ObjectId(req.body.enterpriseId) : null,
          truckLength: req.body.truckLength ? req.body.truckLength : "",
          truckNumber: req.body.truckNumber ? req.body.truckNumber : "",
          isAgreementSign: req.body.isAgreementSign ? req.body.isAgreementSign : "",
          checkedOtp: req.body.otp ? req.body.otp : "",
          customerId: stripeResult.customerId,
          plan: req.body.plan
        }

        userHelper.userRegistration(post2, (err, result) => {
          console.log(err, result);
          if (!utils.isDefined(err)) {
            let secretToken = jwt.createSecretToken({ uid: result._id })
            let now = new Date();
            let validityPeriod = req.body.validityPeriod != null ? req.body.validityPeriod : 0;
            let data = {
              email: result.email,
              firstname: result.firstname,
              lastname: result.lastname,
              username: result.username,
              cb_radio_handle: result.cb_radio_handle,
              organization: result.organization,
              city: result.city,
              state: result.state,
              userType: result.userType,
              phoneNumber: result.phoneNumber,
              truckType: result.truckType,
              enterpriseId: result.enterpriseId,
              truckLength: result.truckLength,
              truckNumber: result.truckNumber,
              isEmailVerify: result.isEmailVerify,
              isAgreementSign: result.isAgreementSign,
              secretToken: secretToken,
            }
            let paymentDetails = {
              user_id: result._id,
              amount: stripeResult.amount,
              currency: stripeResult.currency,
              subscriptionId: stripeResult.subscriptionId,
              stripeCustomerId: stripeResult.stripeCustomerId,
              subscriptionPlan: req.body.plan != null ? req.body.plan : "",
              customerId: stripeResult.customerId,
              expiryDate: stripeResult.expiryDate,

            }
            // paymentHelper.storePaymentDetail(paymentDetails, (err1, result1) => {
              //if (!utils.isDefined(err1)) {
                response = {
                  'data': data,
                  'message': req.t('SUCCESS')
                }
                awsUtils.sendEmail(result.email, result.firstname+" "+result.lastname, "emailverify", config.SITE_URL + "/email-verify/" + result._id, "Email Verification", function (err2, passResult) {
                  if (passResult) {
                    console.log("Exit from userCtr.userRegistration", response)
                    res.status(200).json(response);

                  } else {
                    res.status(400).json(req.t("NOT_SENDMAIL"));
                  }

                });
              // } else {
              //   console.log(err1)
              //   res.status(400).json(req.t("NOT_SENDMAIL"));
              // }
            // })


          } else {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
          }

        })

      } else {
        res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
      }

    })
  }

}

// /* this funtion is use for send email for password*/
// userCtr.sendUserEmail = (pageName, fileName, subject, uName, email) => {
//     let randomStr = utils.makeRandom();
//     let resetpwd = "../mail_content/" + fileName + ".html";
//     utils.getHtmlContent(resetpwd, function (err, content) {
//         let link = config.SITE_URL + pageName + "/" + randomStr;
//         content = content.replace("{USRNAME}", uName);
//         content = content.replace("{LINK}", link);
//         utils.sendEmail(email, subject, content, function () { });
//     });
// }

/*Check Email*/
userCtr.emailExists = (req, res) => {
  console.log(req.body);
  let condition = {
    "email": req.body.email.toLowerCase(),
    "_id": !utils.empty(req.body.userId) ? { $ne: req.body.userId } : ''
  }
  let field = {
    "email": 1
  }
  userHelper.getUserDetail(condition, field, function (err, result) {
    console.log(result);
    if (result.length == 0) {
      res.status(200).json(req.t("SUCCESS"));
    } else {
      res.status(400).json(req.body.email + req.t("EXISTS"));
    }
  });
}

/*Check Username*/
userCtr.usernameExists = (req, res) => {
  console.log(req.body);
  let condition = {
    "username": req.body.username.toLowerCase()
  }
  let field = {
    "username": 1
  }
  userHelper.getUserDetail(condition, field, function (err, result) {
    console.log(result);
    if (result.length == 0) {
      res.status(200).json(req.t("SUCCESS"));
    } else {
      res.status(400).json(req.body.username + req.t("EXISTS"));
    }
  });
}

//OTP verification
userCtr.otp = (req, res) => {
  let condition = {
    "phoneNumber": req.body.phoneNumber.toLowerCase()
  }
  let field = {
    "phoneNumber": 1
  }
  userHelper.getUserDetail(condition, field, function (err, result) {
    console.log(result);
    if (result.length == 0 || req.body.used) {
      console.log(process.env.PRODUCTION);
      if (process.env.PRODUCTION == "true") {
        let otp = utils.makeRandomNumber()
        let params = {
          Message: 'Your OTP for registration in Need-To-Park is ' + otp,
          MessageStructure: 'string',
          PhoneNumber: process.env.COUNTRYCODE + req.body.phoneNumber
        };
        awsUtils.sendOTP(params, function (err, data) {
          console.log(err, data);
          if (err) {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
          } else {
            response = {
              'otp': otp,
              'message': req.t('OTP_SEND')
            }
            res.status(200).json(response);
          }
        });
        // response = {
        //   'otp': otp,
        //   'message': req.t('OTP_SEND')
        // }
        // res.status(200).json(response);
      } else {
        response = {
          'otp': "1234",
          'message': req.t('OTP_SEND')
        }
        res.status(200).json(response);
      }
    } else {
      res.status(400).json(req.body.phoneNumber + req.t("PHONENUM_EXISTS"));
    }
  });
}

//Verify Email
userCtr.emailVerify = (req, res) => {
  console.log(req.params._id)
  let condition = {
    "_id": req.params._id
  }
  let updateValue = {
    "isEmailVerify": true
  }
  userHelper.getUserDetail({
    "_id": req.params._id,
    "isEmailVerify": false
  }, {
      "email": 1,
      "firstname": 1
    }, (err1, user) => {
      if (user.length != 0) {
        utils.modifyField("user", condition, updateValue, (err, result) => {
          console.log(err, result)
          if (err) {
            res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
          } else {
            res.status(200).json(req.t("SUCCESS"));
          }
        })
      } else {
        res.status(400).json(req.t("LINK_EXPIRIED"));
      }
    })
}

//Forgot password - send link to reset password
userCtr.forgotPassword = (req, res) => {
  userHelper.getUserDetail({
    'email': req.body.email.toLowerCase()
  }, {
      "email": 1,
      "firstname": 1,
      "lastname": 1
    }, (err, user) => {
      if (user.length != 0) {
        // console.log(user);
        // console.log(user.email, user.firstname);
        let condition = {
          'email': req.body.email.toLowerCase()
        }
        let updateValue = {
          "isActivated": false
        }
        utils.modifyField("user", condition, updateValue, (err1, result) => {
          awsUtils.sendEmail(user[0].email, user[0].firstname+" "+user[0].lastname, "forgotpassword", config.SITE_URL + "/reset-password/" + user[0]._id, "Forgot Password", function (err, passResult) {
            if (passResult) {
              res.status(200).json(req.t("SENDMAIL"));
            } else {
              res.status(400).json(req.t("NOT_SENDMAIL"));
            }
          });
        })
      } else {
        res.status(400).json(req.body.email + req.t("NOTEXISTS"));
      }
    });
}

//Send email to verify
userCtr.sendEmailToVerify = (req, res) => {
  userHelper.getUserDetail({
    'email': req.params.email.toLowerCase()
  }, {
      "email": 1,
      "firstname": 1,
      "lastname": 1
    }, (err, user) => {
      if (user.length != 0) {
        awsUtils.sendEmail(user.email, user.firstname+" "+user.lastname, "emailverify", config.SITE_URL + "/email-verify/" + user.email, "Email Verification", function (err, passResult) {
          if (passResult) {
            res.status(200).json(req.t("SENDMAIL"));
          } else {
            res.status(400).json(req.t("NOT_SENDMAIL"));
          }

        });
      } else {
        res.status(400).json(req.body.email + req.t("NOTEXISTS"));
      }
    });
}
//Check user can reset password
userCtr.isActivated = (req, res) => {
  userHelper.getUserDetail({
    "_id": req.params._id,
    "isActivated": false
  }, {
      "email": 1,
      "firstname": 1
    }, (err, user) => {
      if (user.length != 0) {
        res.status(200).json(req.t("SUCCESS"));
      }
      else {
        res.status(400).json(req.t("LINK_EXPIRIED"));
      }
    })
}
//Reset password
userCtr.resetPassword = (req, res) => {
  console.log(req.body.userId)
  let condition = {
    "_id": mongoose.Types.ObjectId(req.body.userId),
  }
  let updateValue = {
    "password": md5(req.body.password),
    "isEmailVerify": true,
    "isActivated": true
  }

  utils.modifyField("user", condition, updateValue, (err, result) => {
    console.log(err, result)
    if (err) {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    } else {
      let field = {
        "isAgreementSign": 1,
        "phoneNumber": 1,
        "checkedOtp": 1,
      }
      userHelper.getUserDetail(condition, field, (err, result) => {
        if (!utils.isDefined(err) && result != null) {
          // let response = result[0]
          res.status(200).json(result[0]);
        } else {
          res.status(400).json(req.t("NO_RECORD_FOUND"));
        }
      })
    }
  })
}

//Change password
userCtr.changePassword = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "_id": userId
  }
  let updateValue = {
    "password": md5(req.body.password)
  }
  utils.modifyField("user", condition, updateValue, (err, result) => {
    if (err) {
      res.status(400).json(req.t("OLD_PASS_INCORRECT"));
    } else {
      res.status(200).json(req.t("SUCCESS"));
    }
  })
}

//Sign Agreement
userCtr.signAgreement = (req, res) => {
  let userId = req.body.userId;
  let condition = {
    "_id": mongoose.Types.ObjectId(userId),
  }
  let updateValue = {
    "isAgreementSign": true,
    "checkedOtp": req.body.checkedOtp
  }
  utils.modifyField("user", condition, updateValue, (err, result) => {
    if (err) {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    } else {
      let field = {
        "email": 1,
        "username": 1,
        "cb_radio_handle": 1,
        "firstname": 1,
        "lastname": 1,
        "organization": 1,
        "city": 1,
        "state": 1,
        "userType": 1,
        "phoneNumber": 1,
        "truckType": 1,
        "enterpriseId": 1,
        "truckLength": 1,
        "truckNumber": 1,
        "isEmailVerify": 1,
        "isAgreementSign": 1
      }
      userHelper.getUserDetail(condition, field, (err, result) => {
        console.log(err, result[0]);
        if (!utils.isDefined(err) && result[0] != null) {
          let secteteToken = jwt.createSecretToken({ uid: result[0]._id });
          let response = {
            secteteToken: secteteToken,
            uData: result
          }
          console.log("Exit from userCtr.login", response)
          res.status(200).json(response);
        }
      })
    }
  })
}

/*Test check notification*/
// userCtr.checkNotification = (req, res) => {
//     var post = {
//         senderName: "user",
//         message: "user"
//     };
//     notificationUtil.sendNotificationToDevice(req.body.token, post);
//     res.status(200).json("Send");
// }

/*Profile Detail*/
userCtr.profileDetail = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "_id": userId
  }
  let field = {
    "firstname": 1,
    "lastname": 1,
    "email": 1,
    "city": 1,
    "state": 1,
    "username": 1,
    "cb_radio_handle": 1,
    "address":1,
    "organization": 1,
    "truckType": 1,
    "truckLength": 1,
    "truckNumber": 1,
    "phoneNumber": 1,
    "notification": 1,
    "paymentAutoRenewal": 1,
    "notificationType":1
  }

  userHelper.getUserDetail(condition, field, (err, result) => {
    if (!utils.isDefined(err) && result != null) {
      // let response = result[0]
      res.status(200).json(result[0]);
    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

userCtr.profileUpdate = (req, res) => {
  console.log(req.body);
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "_id": userId,
  }
  let updateValue = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "city": req.body.city,
    "state": req.body.state,
    "username": req.body.username,
    "truckType": req.body.truckType,
    "address":req.body.address,
    "organization": req.body.organization,
    "truckLength": req.body.truckLength,
    "truckNumber": req.body.truckNumber,
    "phoneNumber": req.body.phoneNumber,
    "email": req.body.email.toLowerCase(),
    "notification": req.body.notification,
    "notificationType":req.body.notificationType
  }
  utils.modifyField("user", condition, updateValue, (err, result) => {
    if (err) {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    } else {
      res.status(200).json(req.t("SUCCESS"));
    }
  })
}

userCtr.notification = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "_id": userId,
  }
  let updateValue = {
    "notification": req.body.notification
  }
  utils.modifyField("user", condition, updateValue, (err, result) => {
    if (!err) {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    } else {
      res.status(200).json(req.t("SUCCESS"));
    }
  })
}

userCtr.driverList = (req, res) => {
  let condition = {
    "enterpriseId": null,
    "userType": "Individual",
    "isEmailVerify": true
  }
  if (req.query.driverType != 'individual') {
    condition = {
      "userType": "Individual",
      "enterpriseId": !req.query.enterpriseId ? { $ne: null } : mongoose.Types.ObjectId(req.query.enterpriseId),
      // "isEmailVerify": true
    }
  }

  let field = {
    "firstname": 1,
    "lastname": 1,
    "isBlock": 1,
    "createdAt": 1,
    "updatedAt": 1,
    "userAutoId": 1,
    "isEmailVerify":1
  }

  if (req.query.driverType == 'individual') {
    userHelper.getIndividualList(condition, field, (result) => {
      if (utils.isDefined(result) && result != null) {
        let response = {
          uData: result
        }
        res.status(200).json(response);
      } else {
        res.status(400).json(req.t("NO_RECORD_FOUND"));
      }
    })
  } else {
    userHelper.getEnterpriseList(condition, field, (result) => {
      if (utils.isDefined(result) && result != null) {
        let response = {
          uData: result
        }
        res.status(200).json(response);
      } else {
        res.status(400).json(req.t("NO_RECORD_FOUND"));
      }
    })
  }
}

userCtr.managerList = (req, res) => {
  let condition = {
    "userType": "Enterprise",
    "isEmailVerify": true
  }

  let field = {}

  userHelper.getManagerList(condition, field, (result) => {

    if (utils.isDefined(result) && result != null) {
      let response = {
        uData: result
      }
      res.status(200).json(response);
    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

/**
 * Upload users list (file .csv / .xls only )
 */
userCtr.importUsers = (req, res) => {
  //Get login userId using token
  let path = require('path');

  let userId = jwt.getUserId(req.headers['x-auth-token']);
  // let userId = jwt.getUserId(token);
  let file = req.files.usersList;
  let stringData, array_;
  let valueArray = [];
  let result = [];
  // console.log(userId)
  let ext = path.extname(file.path);

  let csvData = [];
  var readStream = false;
  let invalidNumber = [];
  let invalidEmail = [];
  if (ext === ".csv") {
    fs.createReadStream(file.path).pipe(csv({ delimiter: ',' }))
      .on('data', function (csvrow) {

        if (csvrow[9] != "email") {
          if (!(utils.isEmail(csvrow[9]) && utils.isPhoneNumber(csvrow[8]))) {
            valueArray = [];
            readStream = true;
            if (!utils.isEmail(csvrow[9])) {
              invalidEmail.push(csvrow[9]);
            } if (!utils.isPhoneNumber(csvrow[8])) {
              invalidNumber.push(csvrow[8])
            }
          }
          let emailId = csvrow[7].trim();
          if (emailId != '') {
            valueArray.push({ firstname: csvrow[0],lastname: csvrow[1], username: csvrow[2],address:csvrow[3], city: csvrow[4], state: csvrow[5], cb_radio_handle: csvrow[6], organization: csvrow[7], phoneNumber: csvrow[8], email: csvrow[9], truckType: csvrow[10], truckLength: csvrow[11], truckNumber: csvrow[12], createdAt: new Date(), userType: "Individual", enterpriseId: mongoose.Types.ObjectId(userId), userAutoId: '', isEmailSent: false, isActivated: false });
          }
        }
      })
      .on('end', function () {
        //do something wiht csvData
        // valueArray = valueArray.slice(1);
        if (valueArray.length != 0 && !readStream) {
          insertRecord(valueArray);
        } else {
          return res.status(400).json({ "message": req.t("CSV_FILE_INVALID"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
        }

      });
  } else {
    //Read file
    fs.readFile(file.path, function read(err, data) {
      if (err) {
        return res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
      } else {
        stringData = data.toString();
        let obj = xlsx.parse(file.path); // parses a file
        obj = xlsx.parse(data); // parses a buffer
        xlsJSON(obj, (result) => {
          result = JSON.parse(result);
          result.map((obj) => {
            if (obj[9] != "email") {
              if (!(utils.isEmail(obj[9]) && utils.isPhoneNumber(obj[8]))) {
                valueArray = [];
                readStream = true;
                if (!utils.isEmail(obj[9])) {
                  invalidEmail.push(obj[9]);
                } if (!utils.isPhoneNumber(obj[8])) {
                  invalidNumber.push(obj[8])
                }
              }
              let emailId = obj[9].trim();
              if (!utils.empty(obj) && !utils.empty(emailId)) {
                valueArray.push({ firstname: obj[0],lastname: obj[1], username: obj[2],address:obj[3], city: obj[4], state: obj[5], cb_radio_handle: obj[6], organization: obj[7], phoneNumber: obj[8], email: obj[9], truckType: obj[10], truckLength: obj[11], truckNumber: obj[12], createdAt: new Date(), userType: "Individual", enterpriseId: mongoose.Types.ObjectId(userId), userAutoId: '', isEmailSent: false ,isActivated: false });
              }
            }
          });
          if (valueArray.length != 0 && !readStream) {
            insertRecord(valueArray);
          } else {
            return res.status(400).json({ "message": req.t("CSV_FILE_INVALID"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
          }
        });
      }
    });
  }

  // Insert multiple record in database
  let insertRecord = (valueArray) => {
    function saveAll(userData, i, dataLanth, cb) {
      if (i == dataLanth) {
        cb(false);
      } else {

        userHelper.userRegistration(userData[i], (err, docs) => {
          if (err) {
            console.log(err);
            cb(true);
          } else {
            saveAll(userData, ++i, dataLanth, (isError) => {
              cb(isError);
            })
          }
        });

      }
    }

    if (valueArray.length > 0) {
      userModel.find({}).exec((err, result) => {
        if (!utils.empty(result)) {
          let newOBJEmail = [];
          let newOBJPhone = [];
          let newOBJUsername = [];
          let insertObj = [];

          _.forEach(result, function (v, index) {
            newOBJEmail.push(v.email);
            newOBJPhone.push(v.phoneNumber);
            newOBJUsername.push(v.username);
          });
          // console.log(valueArray);
          insertObj = valueArray.filter(function (d) { return ((newOBJEmail.indexOf(d.email) === -1 && newOBJPhone.indexOf(d.phoneNumber) === -1) && newOBJUsername.indexOf(d.username) === -1) });
          console.log(insertObj);
          if (insertObj.length > 0) {
            let i = 0;
            userHelper.getUserDetail({ "_id": mongoose.Types.ObjectId(userId) }, { "userCount": 1, "plan": 1 }, (errUser, resultUser) => {
              let plan = JSON.parse(process.env.STRIPE_PLAN);
              let planDetail = _.find(plan, ['plan', resultUser[0].plan]);
              if (planDetail.count > (resultUser[0].userCount + insertObj.length)) {
                saveAll(insertObj, i, insertObj.length, (isError) => {
                  if (isError == true) {
                    return res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
                  } else {
                    return res.status(200).json({ "message": req.t("USER_IMPORTED_SUCCESSFULLY") });
                  }
                });

              } else {
                res.status(400).json({ "message": req.t("USER_LIMIT_END"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
              }
            })

          } else {
            return res.status(400).json({ "message": req.t("USER_ALREADY_IMPORTED"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
          }
        } else {
          let i = 0;
          userHelper.getUserDetail({ "_id": mongoose.Types.ObjectId(userId) }, { "userCount": 1, "plan": 1 }, (errUser, resultUser) => {
            let plan = JSON.parse(process.env.STRIPE_PLAN);
            let planDetail = _.find(plan, ['plan', resultUser[0].plan]);
            if (planDetail.count > (resultUser[0].userCount + valueArray.length)) {
              saveAll(valueArray, i, valueArray.length, (isError) => {
                if (isError == true) {
                  return res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN"), "invalidNumber": invalidNumber, "invalidEmail": invalidEmail });
                } else {
                  return res.status(200).json({ "message": req.t("USER_IMPORTED_SUCCESSFULLY") });
                }
              });
            } else {
              res.status(400).json(req.t("USER_LIMIT_END"));
            }
          })

        }
      });
    } else {
      //return res.status(400).json({ "message": req.t("CSV_FILE_INVALID") });
    }
  }

  /**
   * var obj is the XLS file with headers
   * Return xls data to json array
   */
  let xlsJSON = (obj, cb) => {
    let lines = obj[0].data;
    result = [];
    for (let i = 1; i < lines.length; i++) {
      result.push(lines[i]);
    }
    cb(JSON.stringify(result)); //JSON
  }

  /**
   * Send Email to added user.
   */
  /* let sendEmailToUser = (users, cb) => {
    let sentEmailData = [];
    if (typeof users == 'object') {
      awsUtils.sendEmail(users.email, users.firstname, "emailverify", config.SITE_URL + "/email-verify/" + users.email, "Email Verification", function (err, passResult) {
        if (passResult) {
          sentEmailData.push(passResult)
        } else {
          sentEmailData.push(passResult)
        }
        cb(sentEmailData);
      });
    } else {
      _.forEach(users, (user, index) => {
        awsUtils.sendEmail(user.email, user.firstname, "emailverify", config.SITE_URL + "/email-verify/" + user.email, "Email Verification", function (err, passResult) {
          if (passResult) {
            sentEmailData.push(passResult)
          } else {
            sentEmailData.push(passResult)
          }
          if (index == users.length - 1) {
            cb(sentEmailData);
          }
        })
      });
    }
  } */
}

userCtr.sendEmailCron = (req, res) => {
  userHelper.getUserToSendEmail({ isEmailSent: false }, { email: 1, firstname: 1 }, (err, user) => {
    if (user) {
      awsUtils.sendEmail(user.email, user.firstname+" "+user.lastname, "setpassword", config.SITE_URL + "/set-password/" + user._id, "Set Password", function (error, passResult) {
        userHelper.mailSentUpdateUser(user, { isEmailSent: true }, (err, result) => {
          console.log(result)
        })
      });
    }

  })
}

//manager driver list
userCtr.managerDriverList = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "enterpriseId": mongoose.Types.ObjectId(userId),
    "userType": "Individual"
  }
  userModel.count(condition, (err, count) => {
    userHelper.managerDriverList(condition, req.body.start, req.body.maxRecord, (err1, result) => {
      if (err1) {
        res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
      } else {
        let response = {
          "uData": result,
          "totalRecord": count
        }
        res.status(200).json(response);
      }
    })
  })
}

userCtr.driverCount = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition = {
    "enterpriseId": mongoose.Types.ObjectId(userId),
    "userType": "Individual"
  }
  userModel.count(condition, (err, count) => {
    userHelper.getUserDetail({ "_id": mongoose.Types.ObjectId(userId) }, { "userCount": 1 }, (err, result) => {
      // console.log(result, count);
      if (!err && result[0].userCount > count) {
        res.status(200).json(req.t("SUCCESS"));
      }
      else {
        res.status(400).json(req.t("USER_LIMIT_END"));
      }
    })

  })
}

module.exports = userCtr;