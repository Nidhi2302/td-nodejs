let utils = require('../../helper/utils');
let bookingModel = require('./bookingModel.js');
let listingModel = require('../listing/listingModel.js');
let mongoose = require('mongoose');
let bookingHelper = {}

bookingHelper.bookASpace = (details, callback) => {
  let space = new bookingModel(details);
  space.save((err, result) => {
    callback(err, result);
  })
}
bookingHelper.bookingList = (condition, start, userId, sort, callback) => {
  let offset = 0;
  let maxRecord = parseInt(process.env.MAX_RECORD);
  if (!utils.empty(start) && !isNaN(start)) {
    offset = (start - 1) * process.env.MAX_RECORD;
  }
  bookingModel.aggregate([
    {
      $match: condition
    },
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
    }, {
      $lookup: {
        from: 'listings',
        localField: 'listingId',
        foreignField: 'listingId',
        as: 'listingDetail'
      }
    }, {
      $group: {
        _id: "$_id",
        createdAt: { $first: "$createdAt" },
        bookingId: { $first: "$bookingId" },
        listedBy: { $first: { $concat:["$listingUser.firstname"," ","$listingUser.lastname"]} },
        phoneNumber:{ $first: "$listingUser.phoneNumber" },
        cb_radio_handle:{ $first: "$listingUser.cb_radio_handle" },
        location: { $first: "$listingDetail.location" }
      }
    },
    { $sort: sort },
    { $limit: offset + parseInt(process.env.MAX_RECORD) },
    { $skip: offset }
  ], (err, result) => {
    callback(err, result);
  })
}
bookingHelper.managerBookingList = (start, maxRecord, userId, callback) => {
  let offset = 0;
  maxRecord = parseInt(maxRecord);
  if (!utils.empty(start) && !isNaN(start)) {
    offset = (start - 1) * maxRecord;
  }
  bookingModel.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'bookedUserId',
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
        bookingId: { $first: "$bookingId" },
        driver: { $first:{ $concat:[ "$bookingUser.firstname"," ", "$bookingUser.lastname"]} },
        enterpriseID: { $first: "$bookingUser.enterpriseId" }
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

bookingHelper.driverStatus = (userId, callback) => {
  listingModel.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: 'listingId',
        foreignField: 'listingId',
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
        createdAt: { $first: "$createdAt" },
        bookingId: { $first: "$booking.bookingId" },
        listingId:{ $first: "$listingId" },
        location: { $first: "$location" },
        driver: { $first:{ $concat:[ "$bookingUser.firstname"," ","$bookingUser.lastname"]} },
        enterpriseID: { $first: "$bookingUser.enterpriseId" }
      }
    },
    { $sort: { "createdAt": 1 } }
  ], (err, result) => {
    if (result.length != 0) {
      result.map((record) => {
        if (record.enterpriseID && record.enterpriseID.toString() == userId.toString()) {
          record["type"] = "Internal";
        } else {
          record["type"] = "External";
        }
        if(record.bookingId!=null){
          record["isBooked"]=true;
        }else{
          record["isBooked"]=false;
        }
        return record
      })
    }
    callback(err, result);
  })
}


bookingHelper.getCount = (condition, callback) => {
  bookingModel.count(condition, (err, result) => {
    callback(err, result)
  })
}
module.exports = bookingHelper;