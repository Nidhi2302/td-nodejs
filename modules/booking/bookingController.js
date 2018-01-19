let bookingHelper = require('./bookingHelper.js');
let mongoose = require('mongoose');
let jwt = require('../../helper/jwt.js');
let bookingCtrl = {}

bookingCtrl.bookASpace = (req, res) => {
  let bookedUserId = jwt.getUserId(req.headers['x-auth-token']);
  let details = {
    listingId: req.body.listingId,
    listedUserId: mongoose.Types.ObjectId(req.body.listedUserId),
    bookedUserId: mongoose.Types.ObjectId(bookedUserId),
    createdAt: new Date()
  }
  bookingHelper.bookASpace(details, (err, result) => {
    console.log(err, result)
    if (!err) {
      res.status(200).json(req.t("SUCCESS"));
    } else {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    }
  })
}

bookingCtrl.bookingList = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition;
  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    let fromDate=new Date(req.body.fromDate);
    let from=new Date(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
    let toDate=new Date(req.body.toDate);
    let to=new Date(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()+1);
    condition = {
      "bookedUserId": mongoose.Types.ObjectId(userId),
      "createdAt": { $gte: new Date(from),$lte: new Date(to) } 
    }
  } else {
    condition = {
      "bookedUserId": mongoose.Types.ObjectId(userId)
    }
  }
 
  bookingHelper.bookingList(condition, req.body.start, mongoose.Types.ObjectId(userId), req.body.sortBy, (err, result) => {
    // console.log(err,result);
    if (!err) {
      bookingHelper.getCount(condition, (errCount, resultCount) => {
        let response = {
          uData: result,
          totalCount: resultCount
        }
        res.status(200).json(response);
      })

    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

bookingCtrl.bookingListAll = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition;
  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    let fromDate=new Date(req.body.fromDate);
    let from=new Date(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
    let toDate=new Date(req.body.toDate);
    let to=new Date(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()+1);
    condition = {
      "createdAt": { $gte: new Date(from),$lte: new Date(to) } 
    }
  } else {
    condition = {
    }
  }
 
  bookingHelper.bookingList(condition, req.body.start, mongoose.Types.ObjectId(userId), req.body.sortBy, (err, result) => {
    // console.log(err,result);
    if (!err) {
      bookingHelper.getCount(condition, (errCount, resultCount) => {
        let response = {
          uData: result,
          totalCount: resultCount
        }
        res.status(200).json(response);
      })

    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

bookingCtrl.managerBookingList = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
 
  bookingHelper.managerBookingList(req.body.start,req.body.maxRecord, mongoose.Types.ObjectId(userId), (err, result) => {
    // console.log(err,result);
    if (!err) {
      bookingHelper.getCount({}, (errCount, resultCount) => {
        let response = {
          uData: result,
          totalCount: resultCount
        }
        res.status(200).json(response);
      })

    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

bookingCtrl.driverStatus=(req,res)=>{
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  bookingHelper.driverStatus( mongoose.Types.ObjectId(userId),(err,result)=>{
    if (!err) {
        let response = {
          uData: result
        }
        res.status(200).json(response);
    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

module.exports = bookingCtrl;