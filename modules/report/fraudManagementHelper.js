let reportModel = require('./reportModel.js');
let listingModel = require('../listing/listingModel.js');
let bookingModel = require('../booking/bookingModel.js');
let utils = require('../../helper/utils');
let mongoose = require('mongoose');
let fraudManagementHelper = {};


fraudManagementHelper.getFraudBookingsReport = (callback) => {
    reportModel.aggregate([
		{
			$match: { 'bookId': { "$ne": "" } }
		},
		{
			$lookup:
				{
					from: "users",
					localField: "reportedBy",
					foreignField: "_id",
					as: "userDetails"
				}
		},
		{
			$match: { "userDetails": { "$ne": [] } }
		},
		{
			$group: {
				"_id": "$_id",
				"issue": { $first: "$issue" },
				"requestId": { $first: "$reportId" },
				"bookingId": { $first: "$bookingId" },
				"bookId": { $first: "$bookId" },
				"userDetails": { $first: "$userDetails" },
			}
		},
		{
			$project: {
				"_id": 1,
				"issue": 1,
				"requestId": 1,
				"bookingId": 1,
				"bookId": 1,
				"userDetails._id": 1,
				"userDetails.firstname": 1,
				"userDetails.lastname": 1,
				"userDetails.userType": 1,
			}
		}
	]).exec((err, result) => {
		callback(err, result)
	})
}

fraudManagementHelper.getFraudListingsReport = (callback) => {
    reportModel.aggregate([
		{
			$match: { 'listId': { "$ne": "" } }
		},
		{
			$lookup:
				{
					from: "users",
					localField: "reportedBy",
					foreignField: "_id",
					as: "userDetails"
				}
		},
		{
			$match: { "userDetails": { "$ne": [] } }
		},
		{
			$group: {
				"_id": "$_id",
				"issue": { $first: "$issue" },
				"requestId": { $first: "$reportId" },
				"listingId": { $first: "$listingId" },
				"listId": { $first: "$listId" },
				"userDetails": { $first: "$userDetails" },
			}
		},
		{
			$project: {
				"_id": 1,
				"issue": 1,
				"requestId": 1,
				"listingId": 1,
				"listId": 1,
				"userDetails._id": 1,
				"userDetails.firstname": 1,
				"userDetails.lastname": 1,
				"userDetails.userType": 1,
			}
		}
	]).exec((err, result) => {
		callback(err, result)
	})
}

module.exports = fraudManagementHelper;