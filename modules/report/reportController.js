let fraudManagementHelper = require('./fraudManagementHelper.js');
let reportHelper = require('./reportHelper.js');
let utils = require('../../helper/utils.js');
let mongoose = require('mongoose');
let reportCtrl = {}

reportCtrl.reportIssue = (req, res) => {
	let reportData = {
		issue: req.body.issue,
		reportedBy: req.body.reportedBy
	}
	if (req.body.spaceType == 'book') {
		reportData.bookingId = req.body.spaceId;
		reportData.bookId = req.body.bookId;
		reportData.listingId = null;
	} else if (req.body.spaceType == 'list') {
		reportData.bookingId = null;
		reportData.listId = req.body.listId;
		reportData.listingId = req.body.spaceId;
	}
	reportData.reportId = '0';
	reportData.createdAt = new Date();
	reportData.updatedAt = new Date();

	reportHelper.reportIssue(reportData, (err, result) => {
		if (!err) {
			res.status(200).json(req.t("SUCCESS"));
		} else {
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	});
}

reportCtrl.reportCheckForValid = (req, res) => {
	let reqData = req.body;
	if (reqData.type != 'booking' && reqData.type != 'listing') {
		res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
	} else {
		reportHelper.reportCheckForValid(reqData, (err, result) => {
			if (!err && utils.isDefined(result)) {
				res.status(200).json(req.t("SUCCESS"));
			} else {
				res.status(400).json(req.t("NO_DATA_FOUND"))
			}
		});
	}
}

reportCtrl.getFraudBookingsReport = (req, res) => {
	fraudManagementHelper.getFraudBookingsReport((err, result) => {
		if (!err) {
			res.status(200).json(result);
		} else {
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	})
}

reportCtrl.getFraudListingsReport = (req, res) => {
	
	fraudManagementHelper.getFraudListingsReport((err, result) => {
		if (!err) {
			res.status(200).json(result);
		} else {
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	})
}

reportCtrl.reportDetail=(req,res)=>{
	let id=mongoose.Types.ObjectId(req.params.id)
	reportHelper.reportDetail(id,req.params.type,(err,result)=>{
		if (!err) {
			res.status(200).json(result);
		} else {
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	})
}

reportCtrl.blockUser=(req,res)=>{
let id=mongoose.Types.ObjectId(req.params.id)
utils.modifyField("user", {"_id":id}, {"isBlock":true}, (err, result) => {
	console.log(err, result)
	if (err) {
		res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
	} else {
		res.status(200).json(req.t("BLOCK_USER"));
	}
})
}

reportCtrl.unblockUser=(req,res)=>{
	let id=mongoose.Types.ObjectId(req.params.id)
	utils.modifyField("user", {"_id":id}, {"isBlock":false}, (err, result) => {
		console.log(err, result)
		if (err) {
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		} else {
			res.status(200).json(req.t("UNBLOCK_USER"));
		}
	})
	}
module.exports = reportCtrl;