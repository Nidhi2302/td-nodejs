let fs = require('fs');
let feedbackModel = require('../feedback/feedbackModel.js');
let mongoose = require('mongoose');
let feedbackHelper = require('./feedbackHelper.js');
let utils = require('../../helper/utils.js');
var feedbackCtr = {}

feedbackCtr.saveFeedback=(req,res)=>{
	feedbackHelper.storeFeedback(req.body,(err,result)=>{
		if(!err){
			res.status(200).json(req.t("SUCCESS"));
		}else{
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	})
}

feedbackCtr.getAllFeedback=(req,res)=>{
	feedbackHelper.getFeedback((err,result)=>{
		if(!err){
			res.status(200).json(result);
		}else{
			res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
		}
	})
}

module.exports = feedbackCtr; 
