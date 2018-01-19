let stripe = require("stripe")(process.env.STRIPE_SECRET);
let Q = require('q');
let stripeUtils = {};
stripeUtils.createCustomerWithCard = (email, meta, token) => {
	let deferred = Q.defer();
	let customer = {
		account_balance: 0,
		email: email,
		description: 'Customer - ' + email,
		metadata: meta
	};

	if (token != '') {
		customer.card = token;
	}

	stripe.customers.create(customer, function (err, customer) {
		if (err) {
			deferred.reject(err);
		}
		else {
			console.log(customer);
			deferred.resolve(customer);
		}
	});

	return deferred.promise;
}
stripeUtils.createSubscription = (cusId, email, plan) => {
	let deferred = Q.defer();
	stripe.subscriptions.create({
		customer: cusId,
		plan: plan
	}, function (err, subscription) {
		// asynchronously called
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(subscription);
		}
		// console.log( subscription );
	});
	return deferred.promise;
}
stripeUtils.updateSubscription = (subsId, cusId) => {
	let deferred = Q.defer();
	stripe.subscriptions.update(subsId, {
		plan: "daily_plan_test"
	}, function(err, subscription) {
		console.log(err, subscription);
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(subscription);
		}
	});
	return deferred.promise;
}

stripeUtils.cancelSubscription = (subId) => {
	let deferred = Q.defer();
	stripe.subscriptions.del(subId,{"at_period_end": true}, function(err, subscription) {
		// asynchronously called
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(subscription);
		}
	});
	return deferred.promise;
}
stripeUtils.stripeAddCardToCustomer = (cusId, token) => {
	let deferred = Q.defer();
	stripe.customers.createCard(cusId, {
		card: token
	}, function (err, card) {
		console.log(err, card);
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(card);
		}
	});
	return deferred.promise;
}
stripeUtils.deleteCustomerCard = (cusId, cardId) => {
	let deferred = Q.defer();
	stripe.customers.deleteCard(cusId, cardId, function (err, confirmation) {
		console.log(err, confirmation);
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(confirmation);
		}
	});
	return deferred.promise;
}
stripeUtils.defaultCustomerCard = (cusId, cardId) => {
	let deferred = Q.defer();
	stripe.customers.update(cusId, { default_source: cardId }, function (err, customer) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(customer);
		}
	});
	return deferred.promise;
}
stripeUtils.getCustomer = (cusId) => {
	let deferred = Q.defer();
	stripe.customers.retrieve(cusId, function (err, customer) {
		if (!err) {
			deferred.resolve(customer);
		} else {
			deferred.reject(err);
		}
	});
	return deferred.promise;
}
/** Stripe Managed Account */
/*
	email: 'jm@example.com', 
	dob: {
		day: 1 to 31,
		month: 1 to 12,
		year: 4 digit year
	}, 
	type: individual | company, 
	country: 2 digit ID of Country 
	ip: IP address of TOS acceptance, 
	firstName: Jay, 
	lastName: Mehta
 */
stripeUtils.createAccountWithCard = (email, meta, token) => {
	let deferred = Q.defer();
	let account = {
		email: email,
		country: 'US',
		managed: true,
		tos_acceptance: {
			date: Date.now() / 1000 | 0,
			ip: meta.ip,
			user_agent: 'iOS App'
		},
		legal_entity: {
			first_name: meta.firstName,
			last_name: meta.lastName,
			type: meta.type || 'individual',
			dob: meta.dob
		}
	}
	stripe.accounts.create(account, function (err, account) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(account);
		}
	});
	return deferred.promise;
}
stripeUtils.addDebitCardToAccount = (accountId, token) => {
	let deferred = Q.defer();

	stripe.accounts.createExternalAccount(
		accountId,
		{ external_account: token },
		function (err, card) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(card);
			}
		});
	return deferred.promise;
}
stripeUtils.defaultExternalAccountCard = (accountId, cardId) => {
	let deferred = Q.defer();
	stripe.accounts.updateExternalAccount(
		accountId,
		cardId,
		{ "default_for_currency": true },
		function (err, card) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(card);
			}
		}
	);
	return deferred.promise;
}
stripeUtils.getAccount = (accountId) => {
	let deferred = Q.defer();
	stripe.accounts.retrieve(
		accountId,
		function (err, account) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(account);
			}
		}
	);
	return deferred.promise;
}
stripeUtils.chargeCard = (amount, cusId, accountId, appFee, email) => {
	let deferred = Q.defer();
	stripe.charges.create({
		amount: parseInt(amount * 100),	// Changes Done because of Error -> message: 'Invalid integer: 13530.000000000002'
		currency: "usd",
		customer: cusId,
		description: "Charge for " + email,
		destination: accountId,
		application_fee: parseInt(appFee * 100)
	}, function (err, charge) {
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(charge);
		}
	});
	return deferred.promise;
}
stripeUtils.refund = (chargeId) => {
	let deferred = Q.defer();

	stripe.refunds.create({
		charge: chargeId
	}, function (err, refund) {
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(refund);
		}
	});
	return deferred.promise;
}
stripeUtils.stripeDummyToken = (card) => {
	let deferred = Q.defer();
	stripe.tokens.create({
		card: {
			"number": card,
			"exp_month": 12,
			"exp_year": 2017,
			"cvc": '123'
		}
	}, function (err, token) {
		if (err) {
			console.log(err);
			deferred.reject(err);
		}
		else {
			console.log(token);
			deferred.resolve(token);
		}
	});
	return deferred.promise;
}



module.exports = stripeUtils