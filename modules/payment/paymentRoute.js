//Dependencies 
let express = require('express');
let paymentCtrl = require('./paymentController.js');
let auth = require("../../helper/auth");
let paymentRouter = express.Router();
let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();


let autoRenewOn = [auth.checkToken, paymentCtrl.autoPayment];
paymentRouter.post('/auto-payment-on', autoRenewOn);

let autoRenewOff = [auth.checkToken, paymentCtrl.stopAutoPayment];
paymentRouter.get('/auto-payment-off', autoRenewOff);

let getTotalCollection = [auth.checkToken, paymentCtrl.getTotalCollection];
paymentRouter.get('/get-total-collection', getTotalCollection);

let getTotalCollectionByUser = [auth.checkToken, paymentCtrl.getTotalCollectionByUser];
paymentRouter.post('/get-total-collection-by-user', getTotalCollectionByUser);

let autoRenewWebhooks = [paymentCtrl.autoRenewal];
paymentRouter.post('/auto-renewal', autoRenewWebhooks);

module.exports = paymentRouter;