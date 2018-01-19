//Dependencies 
let express = require('express');
let userCtr = require('./userController.js');
let userMiddleware = require('./userMiddleware.js');
let auth = require("../../helper/auth");
let userRouter = express.Router();
let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();

let loginMiddleware = [userMiddleware.validateInput("login"), userCtr.login];
userRouter.post('/login', loginMiddleware);

let signupMiddleware = [userMiddleware.validateInput("signup"), userCtr.userRegistration];
userRouter.post('/sign-up', signupMiddleware);

let emailExistsMiddleware = [userMiddleware.validateInput("emailExists"), userCtr.emailExists];
userRouter.post('/email-exists', emailExistsMiddleware);

let userNameExistsMiddleware = [userMiddleware.validateInput("userNameExists"), userCtr.usernameExists];
userRouter.post('/username-exists', userNameExistsMiddleware);

let otpMiddleware = [userMiddleware.validateInput("otp"), userCtr.otp];
userRouter.post('/otp', otpMiddleware);

let emailVerifyMiddleware = [userCtr.emailVerify];
userRouter.get('/email-verify/:_id', emailVerifyMiddleware);

let isActivatedMiddleware = [userCtr.isActivated];
userRouter.get('/isActivated/:_id', isActivatedMiddleware);

let sendEmailToVerifyMiddleware = [userCtr.sendEmailToVerify];
userRouter.get('/send-email-verify/:email', sendEmailToVerifyMiddleware);

let forgotPasswordMiddleware = [userMiddleware.validateInput("forgotPassword"), userCtr.forgotPassword];
userRouter.post('/forgot-password', forgotPasswordMiddleware);

let resetPasswordMiddleware = [userMiddleware.validateInput("resetPassword"), userCtr.resetPassword];
userRouter.post('/reset-password', resetPasswordMiddleware);

let changePasswordMiddleware = [auth.checkToken, userMiddleware.validateInput("changePassword"), userCtr.changePassword];
userRouter.post('/change-password', changePasswordMiddleware);

let signAgreementMiddleware = [userMiddleware.validateInput("signAgreement"), userCtr.signAgreement];
userRouter.post('/sign-agreement', signAgreementMiddleware);

let profileDetailMiddleware = [userCtr.profileDetail];
userRouter.get('/profile-detail', profileDetailMiddleware);

let profileUpdateMiddleware = [userCtr.profileUpdate];
userRouter.post('/profile-update', profileUpdateMiddleware);

let notificationMiddleware = [userCtr.notification];
userRouter.get('/notification', notificationMiddleware);

let driverListMiddleware = [userCtr.driverList];
userRouter.get('/driver-list', driverListMiddleware);

let managerDriverListMiddleware = [auth.checkToken,userCtr.managerDriverList];
userRouter.post('/manager-driver-list', managerDriverListMiddleware);


let managerListMiddleware = [userCtr.managerList];
userRouter.get('/manager-list', managerListMiddleware);

let massUserRegister = [auth.checkToken,multipartMiddleware, userCtr.importUsers];
userRouter.post('/mass-registration', massUserRegister);


module.exports = userRouter;