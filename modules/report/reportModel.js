let mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

let reportSchema = new mongoose.Schema({
	bookingId: {
		type: ObjectId,
		ref: 'bookings',
		default: null
	},
	bookId:{
		type: String,
		default: ''
	},
	listId:{
		type: String,
		default: ''
	},
	listingId: {
		type: ObjectId,
		ref: 'listings',
		default: null
	},
	reportedBy: {
		type: ObjectId,
		ref: 'users'
	},
	issue: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	},
	reportId: {
		type: String
	}
});


reportSchema.pre('save', function (next) {
	let that = this;
	if (that.reportId == '0') {
		report.find({}, function (error, counters) {
			let digit = counters.length.toString().length;
			let addZero = '';
			for (let i = 0; i <= 5 - digit; i++) {
				addZero += '0';
			}
			that.reportId = "R" + addZero + (+counters.length + 1)
			next()
		})
	} else {
		next()
	}
})

let report = mongoose.model('report', reportSchema);
module.exports = report;