//Dependencies
let express = require('express'); 
let feedbackCtrl = require('./feedbackController.js');
let auth = require("../../helper/auth");
let feedbackRouter = express.Router();

//store feedback
let saveFeedback = [feedbackCtrl.saveFeedback];
feedbackRouter.post('/save-feedback', saveFeedback);

//get all feedback
let getAllFeedback = [auth.checkToken, feedbackCtrl.getAllFeedback];
feedbackRouter.get('/get-feedback', getAllFeedback);

module.exports = feedbackRouter;