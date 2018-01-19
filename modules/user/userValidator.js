let validator = {};
validator.getuserValidator = (req, type) => {
    let input = {
            login: {
                userName: ["notEmpty", req.t("USERNAME_REQUIRE")],
                password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
            },
            signup:{
                firstname: ["notEmpty", req.t("NAME_REQUIRE")],
                email: ["notEmpty", req.t("EMAIL_REQUIRE")],
                phoneNumber: ["notEmpty", req.t("PHONE_REQUIRE")],
            },
            forgotPassword: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")]
            },
            emailExists: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")]
            },
            userNameExists: {
                username:["notEmpty", req.t("USERNAME_REQUIRE")]
            },
            otp: {
                phoneNumber:["notEmpty", req.t("PHONE_REQUIRE")]
            },
            resetPassword:{
                email:["notEmpty", req.t("EMAIL_REQUIRE")],
                password:["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
               
            },
            changePassword:{
                email:["notEmpty", req.t("EMAIL_REQUIRE")],
                newPassword:["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
                oldPassword:["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
            },
            signAgreement: {
                userId: ["notEmpty", req.t("USERID_REQUIRE")],
                checkedOtp:["notEmpty", req.t("OTP_REQUIRE")],
            },
        };
        return input[type];
}

module.exports = validator;

