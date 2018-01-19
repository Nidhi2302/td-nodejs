let utils = require('../../helper/utils');
let listingModel = require('./listingModel.js');
let userHelper = require('../user/userHelper.js');
let mongoose = require('mongoose');
let listingHelper = {}

listingHelper.listASpace = (details, callback) => {
  let space = new listingModel(details);
  space.save((err, result) => {
    callback(err, result);
  })
}
listingHelper.findASpace = (params, userId, callback) => {
  listingModel.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [params.lng, params.lat] },
        distanceField: "dist.calculated",
        maxDistance: params.radius * 1609.34,
        includeLocs: "dist.location",
        spherical: true
      }
    },
    {
      $match: {
        "expired": { $eq: false }
      }
    },
    {
      $lookup: {
        from: 'bookings',
        localField: 'listingId',
        foreignField: 'listingId',
        as: 'bookingDetail'
      }
    },

    {
      $lookup: {
        from: 'users',
        localField: 'listedUserId',
        foreignField: '_id',
        as: 'userDetail'
      }
    },
    {
      $unwind: {
        path: "$userDetail",
        preserveNullAndEmptyArrays: true
      }
    },
  ], function (err, result) {
    console.log(err, result);
    if (!err && result.length != 0) {
      userHelper.getUserDetail({ "_id": mongoose.Types.ObjectId(userId) }, { "enterpriseId": 1 }, (err2, result2) => {

        result.forEach(record => {
          record.userDetail.enterpriseId = record.userDetail.enterpriseId == null ? '' : record.userDetail.enterpriseId;
          if (record.bookingDetail.length != 0) {
            record["isBooked"] = true;
          } else {
            record["isBooked"] = false;
          }
          if (result2[0].enterpriseId) {
            if (result2[0].enterpriseId.toString() == record.userDetail.enterpriseId.toString()) {
              record["type"] = "Internal";
            } else {
              record["type"] = "External";
            }
          }

        })
        callback(err, result)
      })

    }

  })
}
listingHelper.findASpaceDetail = (params, callback) => {
  listingModel.aggregate([{
    $match: {
      "_id": mongoose.Types.ObjectId(params)
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'listedUserId',
      foreignField: '_id',
      as: 'userDetail'
    }
  },
  {
    $unwind: {
      path: "$userDetail",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $group: {
      _id: "$_id",
      location: { $first: "$location" },
      description: { $first: "$description" },
      available: { $first: "$available" },
      max_vehicle_size: { $first: "$max_vehicle_size" },
      listedBy: { $first: { $concat: ["$userDetail.firstname", " ", "$userDetail.lastname"] } },
      phoneNumber: { $first: "$userDetail.phoneNumber" },
      listedUserId: { $first: "$userDetail._id" },
      listingId: { $first: "$listingId" }
    }
  }
  ], (err, result) => {
    console.log(err, result)
    callback(err, result);
  })
}
listingHelper.listingList = (condition, start, userId, sort, callback) => {
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(start) && !isNaN(start)) {
    offset = (start - 1) * process.env.MAX_RECORD;
  }
  listingModel.aggregate([
    {
      $match: condition
    },
    {
      $lookup: {
        from: 'bookings',
        localField: 'listingId',
        foreignField: 'listingId',
        as: 'bookingDetail'
      }
    },
    {
      $unwind: {
        path: "$bookingDetail",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'bookingDetail.bookedUserId',
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
        createdAt: { $first: "$createdAt" },
        listingId: { $first: "$listingId" },
        bookedBy: { $first: { $concat: ["$bookingUser.firstname", " ", "$bookingUser.lastname"] } },
        location: { $first: "$location" }
      }
    },
    { $sort: sort },
    { $limit: offset + parseInt(process.env.MAX_RECORD) },
    { $skip: offset }], (err, result) => {
      callback(err, result);
    })
}

listingHelper.managerListingList = (start, maxRecord, userId, callback) => {
  let offset = 0;
  maxRecord = parseInt(maxRecord);
  if (!utils.empty(start) && !isNaN(start)) {
    offset = (start - 1) * maxRecord;
  }
  listingModel.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'listedUserId',
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
        createdAt: { $first: "$createdAt" },
        listingId: { $first: "$listingId" },
        driver: { $first: { $concat: ["$listingUser.firstname", " ", "$listingUser.lastname"] } },
        enterpriseID: { $first: "$listingUser.enterpriseId" }
      }
    },
    { $sort: { "createdAt": 1 } },
    { $limit: offset + parseInt(maxRecord) },
    { $skip: offset }
  ], (err, result) => {
    if (result.length != 0) {
      result.map((record) => {
        if (record.enterpriseID && record.enterpriseID.toString() == userId.toString()) {
          record["type"] = "Internal";
        } else {
          record["type"] = "External";
        }
        return record
      })
    }
    callback(err, result);
  })
}


listingHelper.getCount = (condition, callback) => {
  listingModel.count(condition, (err, result) => {
    callback(err, result)
  })
}

listingHelper.expireListedSpace = () => {
  listingModel.find({},(err,result)=>{
    result.forEach(record=>{
      let currentTime=new Date();
      let diff = Math.abs(Math.round((currentTime.getTime() - record.available.getTime()) / 60000));
      if(diff>=10){
        // console.log(diff);
        listingModel.update({_id:record._id},{"expired":true},(err1,result1)=>{
          //nothing
        })
      }else{
        console.log(diff);
      }
    })
  })
}
module.exports = listingHelper;