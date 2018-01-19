let reportModel = require('./reportModel.js');
let listingModel = require('../listing/listingModel.js');
let bookingModel = require('../booking/bookingModel.js');
let utils = require('../../helper/utils');
let mongoose = require('mongoose');
let reportHelper = {};

reportHelper.reportIssue = (issueData, callback) => {
	let saveIssue = new reportModel(issueData)
	saveIssue.save((err, result) => {
		callback(err, result);
	});
}

reportHelper.reportCheckForValid = (reqData, callback) => {
	if (reqData.type == 'booking') {
		bookingModel.findOne({ _id: reqData.id, bookingId: reqData.blId }).exec((err, response) => {
			callback(err, response)
		});
	} else if (reqData.type == 'listing') {
		listingModel.findOne({ _id: reqData.id, listingId: reqData.blId }).exec((err, response) => {
			callback(err, response)
		});
	}
}

reportHelper.reportDetail = (id, type, callback) => {
	let queryArray = [];
	if (type == "booking") {
		queryArray = [
			{
				$match: {
					"_id": id
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'reportedBy',
					foreignField: '_id',
					as: 'reportedUser'
				}
			},
			{
				$unwind: {
					path: "$reportedUser",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 'bookings',
					localField: 'bookingId',
					foreignField: '_id',
					as: 'booking'
				}
			},
			{
				$unwind: {
					path: "$booking",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'booking.bookedUserId',
					foreignField: '_id',
					as: 'bookingUser'
				}
			},
			{
				$unwind: {
					path: "$bookingUser",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: "$_id",
					"reportId": { $first: "$reportId" },
					"bookingId": { $first: "$bookId" },
					"reportedBy": { $first: { $concat: ["$reportedUser.firstname", " ", "$reportedUser.lastname"] } },
					"againstUser": { $first: { $concat: ["$bookingUser.firstname", " ", "$bookingUser.lastname"] } },
					"againstUserId": { $first: "$bookingUser._id" },
					"isBlock": { $first: "$bookingUser.isBlock" },
					"role": { $first: "$reportedUser.userType" },
					"brife": { $first: "$issue" },
				}
			}
		]
	} else {
		queryArray = [
			{
				$match: {
					"_id": id
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'reportedBy',
					foreignField: '_id',
					as: 'reportedUser'
				}
			},
			{
				$unwind: {
					path: "$reportedUser",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 'listings',
					localField: 'listingId',
					foreignField: '_id',
					as: 'listing'
				}
			},
			{
				$unwind: {
					path: "$listing",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'listing.listedUserId',
					foreignField: '_id',
					as: 'listingUser'
				}
			},
			{
				$unwind: {
					path: "$listingUser",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: "$_id",
					"reportId": { $first: "$reportId" },
					"listingId": { $first: "$listId" },
					"reportedBy": { $first: { $concat: ["$reportedUser.firstname", " ", "$reportedUser.lastname"] } },
					"againstUser": { $first: { $concat: ["$listingUser.firstname", " ","$listingUser.lastname"] } },
					"againstUserId": { $first: "$listingUser._id" },
					"isBlock": { $first: "$listingUser.isBlock" },
					"role": { $first: "$reportedUser.userType" },
					"brife": { $first: "$issue" },
				}
			}
		]
	}
	reportModel.aggregate(queryArray, (err, result) => {
		callback(err, result)
	})
}

module.exports = reportHelper;