let fs = require('fs');
let StripeUtility = require('../../helper/stripeUtils');
let jwt = require('../../helper/jwt');
let awsUtils = require('../../helper/awsUtils.js');
let usersModel = require('../user/userModel.js');
let paymentModel = require('../payment/paymentModel.js');
let mongoose = require('mongoose');
let paymentHelper = require('./paymentHelper.js');
let userCtr = require('../user/userController.js');
let utils = require('../../helper/utils.js');
var paymentCtr = {}


paymentCtr.addCard = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (result) {
		console.log(result.stripeCustomerId)
		if (result) {
			if (!result.stripeCustomerId) {
				// Stripe Customer not found - Add Card by creating Customer
				StripeUtility.createCustomerWithCard(result.email, { firstname: req.body.firstname, lastname: req.body.lastname }, req.body.token).then(function (customer) {
					params = { stripeCustomerId: customer.id }
					userCtr.userUpdate("users", params, "id=" + userId, function (results) {
						if (result) {
							res.json({ message: req.t("STRIPE_CRADIT_CARD") });
						}
					})
				}, function (err) {
					res.status(400).json({ message: err.message });
				});
			} else {
				// Add Card to Customer
				StripeUtility.stripeAddCardToCustomer(result.stripeCustomerId, req.body.token).then((card) => {
					res.json({ message: req.t("STRIPE_CRADIT_CARD") });
				}, (err) => {
					res.status(err.statusCode).json({ message: err.message });
				})
			}
		} else {
			res.status(400).json(req.t("NOT_VALID_USER"));
		}
	});
}
paymentCtr.getCards = (req, res) => {
	let params = req.body;
	var err = '';
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (results) {
		if (results.stripeCustomerId) {
			StripeUtility.getCustomer(results.stripeCustomerId).then((customer) => {
				res.json({ defaultCard: customer.default_source, cards: customer.sources.data });
			}, (err) => {
				res.status(err.statusCode).json({ message: err.message });
			});
		} else {
			res.json({ cards: [] });
		}
	})
}
paymentCtr.getDebitCards = (req, res) => {
	let params = req.body;
	var err = '';
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (user.stripeAccountId) {
			StripeUtility.getAccount(user.stripeAccountId).then((account) => {
				var defaultCard = '';
				for (var x in account.external_accounts.data) {
					let card = account.external_accounts.data[x];
					if (card.default_for_currency == true) {
						defaultCard = card.id;
					}
				}
				res.json({ defaultCard: defaultCard, cards: account.external_accounts.data /*, account: account */ });
			}, (err) => {
				res.status(err.statusCode).json({ message: err.message });
			});
		} else {
			res.json({ cards: [] });
		}
	});

}
paymentCtr.defaultDebitCard = (req, res) => {
	let params = req.body;
	var err = '';
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (user) {
			if (user.stripeAccountId) {
				StripeUtility.defaultExternalAccountCard(user.stripeAccountId, params.cardId).then((card) => {
					StripeUtility.getAccount(user.stripeAccountId).then((account) => {
						var defaultCard = '';
						for (var x in account.external_accounts.data) {
							let card = account.external_accounts.data[x];
							if (card.default_for_currency == true) {
								defaultCard = card.id;
							}
						}
						res.json({ defaultCard: defaultCard, cards: account.external_accounts.data /*, account: account */ });
					}, (err) => {
						res.status(err.statusCode).json({ message: err.message });
					});
				}, (err) => {
					res.status(err.statusCode).json({ message: err.message });
				});
			} else {
				res.status(400).json({ message: req.t("CARD_INVALID") });
			}
		} else {
			res.status(400).json(req.t("NOT_VALID_USER"));
		}
	});

}
paymentCtr.deleteDebitCard = (req, res) => {
	let params = req.body;
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (user) {
			if (user.stripeAccountId) {
				StripeUtility.deleteExternalAccountCard(user.stripeAccountId, params.cardId).then((confirmation) => {
					res.json({ confirmation: confirmation });
				}, (err) => {
					res.status(err.statusCode).json({ message: err.message });
				});
			} else {
				res.status(400).json({ message: req.t("ACCOUNT_INVALID") });
			}
		} else {
			res.status(400).json({ message: req.t("NOT_VALID_USER") });
		}
	});
}
paymentCtr.deleteCard = (req, res) => {
	let params = req.body;
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (user) {
			if (user.stripeCustomerId) {
				StripeUtility.deleteCustomerCard(user.stripeCustomerId, params.cardId).then((confirmation) => {
					res.json({ confirmation: confirmation });
				}, (err) => {
					res.status(err.statusCode).json({ message: err.message });
				});
			} else {
				res.status(400).json({ message: req.t("CARD_INVALID") });
			}
		} else {
			res.status(400).json({ message: req.t("NOT_VALID_USER") });
		}
	});

}
paymentCtr.defaultCard = (req, res) => {
	let params = req.body;
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (user) {
			if (user.stripeCustomerId) {
				StripeUtility.defaultCustomerCard(user.stripeCustomerId, params.cardId).then((customer) => {
					res.json({ defaultCard: customer.default_source, cards: customer.sources.data });
				}, (err) => {
					res.status(err.statusCode).json({ message: err.message });
				});
			} else {
				res.status(400).json({ message: req.t("CARD_INVALID") });
			}
		} else {
			res.status(400).json({ message: req.t("NOT_VALID_USER") });
		}
	});
}
paymentCtr.addDebitCard = (req, res) => {
	let params = req.body;
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	usersModel.getUsersById(userId, function (user) {
		if (!user.stripeAccountId) {
			// Stripe Customer not found - Add Card by creating Customer
			StripeUtility.createAccountWithCard(user.email, { firstName: params.firstname, lastName: params.lastname, ip: params.ip, dob: params.dob }).then(function (account) {
				user.stripeAccountId = account.id;
				user.save((err, result) => {
					if (!err) {
						// Add card to Account
						StripeUtility.addDebitCardToAccount(account.id, params.token).then((card) => {
							res.json({ message: req.t("DEBIT_CARD_ADDED") });
						}, (err) => {
							res.status(err.statusCode).json({ message: err.message });
						})
					} else {
						res.status(400).json({ message: err });
					}
				})
			}, function (err) {
				res.status(err.statusCode).json({ message: err.message });
			});
		} else {
			// Add Card to Account
			StripeUtility.addDebitCardToAccount(user.stripeAccountId, params.token).then((card) => {
				res.json({ message: req.t("DEBIT_CARD_ADDED") });
			}, (err) => {
				res.status(err.statusCode).json({ message: err.message });
			})
		}
	});
}
paymentCtr.checkStripeToken = (req, res) => {
	console.log(req.body);
	StripeUtility.stripeDummyToken(req.body.card).then(function (result) {
		res.status(200).json({ result: result });
	}, function (err) {
		res.status(err.statusCode).json({ message: err.message });
	});

}

paymentCtr.autoRenewal = (req, res) => {
	if (req.body.type == "customer.subscription.deleted") {
		let fields = {
			paymentAutoRenewal: false
		}
		utils.modifyField("user", { customerId: req.body.data.object.customer }, fields, (err, updateSubscription) => {
			if (!utils.empty(updateSubscription)) {
				return res.status(200).json({ "message": req.t("CANCEL_SUBSCRIBE_SUCCESS") });
			} else {
				return res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
			}
		});
	} else if (req.body.type == "invoice.payment_succeeded") {

		// console.log(req.body);
		// console.log(new Date(req.body.data.object.period_end * 1000));
		// console.log(req.body.data.object.period_end);
		let condition = { customerId: req.body.data.object.customer };
		usersModel.findOne({ customerId: req.body.data.object.customer }).exec((err, result) => {
			// console.log(err, result);
			if (!utils.empty(result.customerId)) {
				let paymentDetails = {
					user_id: result._id,
					amount: req.body.data.object.total,
					currency: req.body.data.object.currency,
					subscriptionId: req.body.data.object.subscription,
					stripeCustomerId: req.body.data.object.customer,
					subscriptionPlan: req.body.data.object.lines.data[0].plan.id,
					customerId: req.body.data.object.customer,
					expiryDate: new Date(req.body.data.object.lines.data[0].period.end * 1000),
					autoRenewalObj: req.body.data

				}
				paymentHelper.storePaymentDetail(paymentDetails, (err1, result1) => {
					if (!utils.isDefined(err1)) {
						let subResponse = {
							"message": req.t("SUBSCRIBE_SUCCESS")
						}
						let paymentSuccess = "./mail-content/payment_success.html";
						utils.getHtmlContent(paymentSuccess, function (errEmail, content) {
							content = content.replace("{AMOUNT}", (req.body.data.object.total*0.01));
							awsUtils.simpleEmail(result.email, result.firstname+" "+result.lastname,content,"Payment Success", function (error, passResult) {})
						});
						return res.status(200).json(subResponse);
					}
				})
			}
			else {

				return res.status(400).json({ "message": req.t("NO_RECORD") });

			}
		})
	} else if (req.body.type == "invoice.payment_failed") {
		let fields = {
			paymentAutoRenewal: false,
		}
		let condition = { customerId: req.body.data.object.customer };
		consumerModel.findOne({ customerId: req.body.data.object.customer }).exec((err, result) => {
			utils.modifyField("consumers", { customerId: req.body.data.object.customer }, fields, (err, updateSubscription) => {
				if (!utils.empty(updateSubscription)) {
					let paymentSuccess = "./mail-content/payment_fail.html";
					utils.getHtmlContent(paymentSuccess, function (errEmail, content) {
						let body = content.replace("{AMOUNT}", (req.body.data.object.total*0.01));
						utils.sendEmailToCustomer(result.email, "Your most recent invoice payment failed - Need-To-Park", body, function () { });
					});
					return res.status(200).json({ "message": req.t("CANCEL_SUBSCRIBE_SUCCESS") });
				} else {
					return res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
				}
			});
		});
	} else {
		awsUtils.simpleEmail("nitish.thakrar.sa@gmail.com", "", JSON.stringify(req.body), req.body.type, function (error, passResult) {})
		return res.status(200).json({ "message": req.t("PLEASE_TRY_AGAIN") });
	}

}

paymentCtr.stopAutoPayment = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	console.log(userId);
	paymentModel.findOne({ "user_id": mongoose.Types.ObjectId(userId) }).sort({ "_id": -1 }).exec((err, result) => {
		console.log(err, result);
		if (!utils.empty(result)) {
			let subscriptionId = result.subscriptionId;
			StripeUtility.cancelSubscription(subscriptionId).then((result) => {
				console.log(result);
				utils.modifyField("user", { _id: userId }, { "paymentAutoRenewal": false }, (err, response) => {
					console.log(err, response);
					let cancelSub = {
						isCancelSubscription: true
					}
					utils.modifyField("payment", { user_id: userId }, cancelSub, (err, cancelSubscription) => {
						if (!utils.empty(cancelSubscription)) {
							res.status(200).json({ "message": req.t("CANCEL_SUBSCRIBE_SUCCESS") });
						} else {
							console.log("Inside")
							res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
						}
					});
				});
			});
		} else {
			res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
		}
	});
}

paymentCtr.autoPayment = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	console.log(userId);
	paymentModel.findOne({ "user_id": userId }).sort({ "_id": -1 }).exec((err, result) => {
		console.log(err, result)
		if (!utils.empty(result)) {
			let subscriptionId = result.subscriptionId;
			StripeUtility.updateSubscription(subscriptionId).then(function (subscription) {
				console.log(subscription);
				utils.modifyField("user", { _id: userId }, { "paymentAutoRenewal": true }, (err, response) => {
					let fields = {
						subscriptionId: subscriptionId,
					}
					console.log(fields);
					utils.modifyField("payment", { subscriptionId: subscriptionId }, fields, (err, updateSubscription) => {
						if (!utils.empty(updateSubscription)) {
							res.status(200).json({ "message": req.t("UPDATE_SUBSCRIBE_SUCCESS") });
						} else {
							res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
						}
					});
				});
			});
		}
	});
}

paymentCtr.getTotalCollection = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);
	paymentHelper.getTotalCollection((err, responseData) => {
		if (err) {
			res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
		} else {
			res.status(200).json(responseData);
		}
	})
}

paymentCtr.getTotalCollectionByUser = (req, res) => {
	let userId = jwt.getUserId(req.headers["x-auth-token"]);

	paymentHelper.getTotalCollectionByUser(req.body.userId, (err, responseData) => {
		if (err) {
			res.status(400).json({ "message": req.t("PLEASE_TRY_AGAIN") });
		} else {
			res.status(200).json(responseData);
		}
	})
}
module.exports = paymentCtr; 
