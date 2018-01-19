let mongoose = require('mongoose');
// const Schema = mongoose.Schema

let userSchema = new mongoose.Schema({
	email: {
		type: String,
	},
	firstname: {
		type: String,
	},
	lastname: {
		type: String,
	},
	userAutoId: {
		type: String,
		default: ''
	},
	username: {
		type: String,
	},
	cb_radio_handle: {
		type: String,
	},
	password: {
		type: String,
	},
	userType: {
		type: String,
	},
	address: {
		type: String,
	},
	organization: {
		type: String,
	},
	city: {
		type: String,
	},
	state: {
		type: String,
	},
	phoneNumber: {
		type: String
	},
	enterpriseId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	},
	isBlock: {
		type: Boolean,
		default: false
	},
	truckType: {
		type: String
	},
	truckLength: {
		type: String
	},
	truckNumber: {
		type: String
	},
	isEmailVerify: {
		type: Boolean,
		default: false
	},
	isAgreementSign: {
		type: Boolean,
		default: false
	},
	checkedOtp: {
		type: String
	},
	createdAt: {
		type: Date,
		default: new Date(),
	},
	updatedAt: {
		type: Date,
		default: new Date(),
	},
	isEmailSent: {
		type: Boolean,
		default: true
	},
	notification: {
		type: Boolean,
		default: true
	},
	notificationType:{
		type:String,
		default:'SMS & Email'
	},
	isActivated: {
		type: Boolean,
		default: true
	},
	userCount:{
		type : Number,
		default:0
	},
	plan:{
		type:String
	},
	customerId: {
		type: String
	},
	paymentAutoRenewal: {
		type:Boolean,
		default: true
	},
	badgeCount: {
		type: Number,
		default: 0
	}
});

userSchema.pre('save', function (next) {
	let that = this
	if (that.userAutoId == '') {
		if (that.userType == 'Individual' && that.enterpriseId == null) {
			user.find({
				userType: 'Individual',
				enterpriseId: null
			}, function (error, counters) {
				var digit = counters.length.toString().length;
				var addZero = '';
				for (var i = 0; i <= 5 - digit; i++) {
					addZero += '0';
				}
				that.userAutoId = 'ID' + addZero + (+counters.length + 1)
				next()
			})
		} else if (that.userType == 'Individual' && that.enterpriseId != '') {
			user.find({
				userType: 'Individual',
				enterpriseId: {
					$ne: null
				}
			}, function (error, counters) {
				var digit = counters.length.toString().length;
				var addZero = '';
				for (var i = 0; i <= 5 - digit; i++) {
					addZero += '0';
				}
				that.userAutoId = 'ED' + addZero + (+counters.length + 1)
				next()
			})
		} else {
			user.find({
				userType: 'Enterprise',
			}, function (error, counters) {
				var digit = counters.length.toString().length;
				var addZero = '';
				for (var i = 0; i <= 5 - digit; i++) {
					addZero += '0';
				}
				that.userAutoId = 'M' + addZero + (+counters.length + 1)
				next()
			})
		}
	} else {
		next()
	}
})

let user = mongoose.model('user', userSchema);
module.exports = user;