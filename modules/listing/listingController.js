let listingHelper = require('./listingHelper.js');
let mongoose = require('mongoose');
let jwt = require('../../helper/jwt.js');
let utils = require('../../helper/utils.js');
let listingCtrl = {}

listingCtrl.listASpace = (req, res) => {
  let listedUserId = jwt.getUserId(req.headers['x-auth-token']);
  let details = {
    location: [req.body.lng, req.body.lat],
    address: (req.body.address) ? req.body.address : '',
    available: req.body.available,
    description: req.body.description,
    max_vehicle_size: req.body.max_vehicle_size,
    listedUserId: mongoose.Types.ObjectId(listedUserId),
    listingId: 0,
    createdAt: new Date()
  }
  listingHelper.listASpace(details, (err, result) => {
    // console.log(err, result);
    if (err) {
      res.status(400).json(req.t("PLEASE_TRY_AGAIN"));
    } else {
      res.status(200).json(req.t("SUCCESS"));
    }
  })
}

listingCtrl.listingList = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  let condition;
  if (req.body.fromDate != undefined && req.body.toDate != undefined) {
    let fromDate=new Date(req.body.fromDate);
    let from=new Date(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
    let toDate=new Date(req.body.toDate);
    let to=new Date(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()+1);
    condition = {
      "listedUserId": mongoose.Types.ObjectId(userId),
      "createdAt": { $gte: new Date(from),$lte: new Date(to) } 
    }
  } else {
    condition = {
      "listedUserId": mongoose.Types.ObjectId(userId)
    }
  }
 
  listingHelper.listingList(condition,req.body.start, mongoose.Types.ObjectId(userId), req.body.sortBy, (err, result) => {
    // console.log(err,result);
    if (!err) {
      listingHelper.getCount(condition, (errCount, resultCount) => {
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


listingCtrl.listingListAll = (req, res) => {
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
 
  listingHelper.listingList(condition,req.body.start, mongoose.Types.ObjectId(userId), req.body.sortBy, (err, result) => {
    // console.log(err,result);
    if (!err) {
      listingHelper.getCount(condition, (errCount, resultCount) => {
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

//find a Space
listingCtrl.findASpace = (req, res) => {
  // console.log(req.body);
  let userId = jwt.getUserId(req.headers['x-auth-token']);
  listingHelper.findASpace(req.body,userId, (err, result) => {
    if (err) {
      res.status(400).json(req.t("NO_SPACE"));
    }
    else {
      response = {
        uData: result
      }
      // console.log(response)
      res.status(200).json(response);
    }
  })

}
listingCtrl.findASpaceDetail = (req, res) => {
  // console.log(req.params)
  listingHelper.findASpaceDetail(req.params.id, (err, result) => {
    if (!err) {
      res.status(200).json(result);
    } else {
      res.status(400).json(req.t("NO_RECORD_FOUND"));
    }
  })
}

listingCtrl.managerListingList = (req, res) => {
  let userId = jwt.getUserId(req.headers['x-auth-token']);
 
  listingHelper.managerListingList(req.body.start,req.body.maxRecord, mongoose.Types.ObjectId(userId), (err, result) => {
    // console.log(err,result);
    if (!err) {
      listingHelper.getCount({}, (errCount, resultCount) => {
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

module.exports = listingCtrl;