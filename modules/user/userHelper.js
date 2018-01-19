let userModel = require('./userModel.js');
let utils = require('../../helper/utils');
let mongoose = require('mongoose');
let userHelper = {};

userHelper.userRegistration = (user, callback) => {
  let saveUser = new userModel(user)
  saveUser.save((err, result) => {
    callback(err, result);
  });
}

/* This function return only userdetail and secrete token*/
userHelper.getUserDetail = (condition, field, callback) => {
  userModel.find(condition, field,
    function (err, result) {
      //console.log(result);
      callback(err, result);
    });
}

userHelper.managerDriverList = (condition, start, maxRecord, callback) => {
  let offset = 0;
  maxRecord = parseInt(maxRecord);
  if (!utils.empty(start) && !isNaN(start)) {
    offset = (start - 1) * maxRecord;
  }
  userModel.aggregate([{
    $match: condition
  }, {
    $group: {
      _id: "$_id",
      firstname: { $first: "$firstname" },
      lastname: { $first: "$lastname" },
      email: { $first: "$email" },
      truckNumber: { $first: "$truckNumber" },
      phoneNumber: { $first: "$phoneNumber" },
      isBlock: { $first: "$isBlock" }
    }
  },
  { $sort: { "firstname": 1 } },
  { $limit: offset + parseInt(maxRecord) },
  { $skip: offset }],
    function (err, result) {
      console.log(err,result);
      callback(err, result);
    });
}

/* This function return only userdetail and secrete token*/
userHelper.getIndividualList = (condition, field, callback) => {
  userModel.aggregate({
    $lookup: {
      from: 'payments',
      localField: '_id',
      foreignField: 'user_id',
      as: 'paymentDetail'
    }
  }, {
      $match: condition
    }, {
      $unwind: {
        path: "$paymentDetail",
        preserveNullAndEmptyArrays: true
      }
    }, {
      $sort: {
        "paymentDetail.expiryDate": -1
      }
    }, {
      $group: {
        _id: "$_id",
        firstname: {
          $first: "$firstname"
        },
        lastname: {
          $first: "$lastname"
        },
        isBlock: {
          $first: "$isBlock"
        },
        isEmailVerify: {
          $first: "$isEmailVerify"
        },
        createdAt: {
          $first: "$createdAt"
        },
        userAutoId: {
          $first: "$userAutoId"
        },
        expiryDate: {
          $first: "$paymentDetail.expiryDate"
        }
      }
    }).then(function (result) {
      console.log(result);
      callback(result);
    }).catch(function (err) {
      console.log("err", err);
      callback(err);
    })
}

/* This function return only userdetail and secrete token*/
userHelper.getEnterpriseList = (condition, field, callback) => {
  console.log(condition);
  userModel.aggregate({
    $lookup: {
      from: 'payments',
      localField: 'enterpriseId',
      foreignField: 'user_id',
      as: 'paymentDetail'
    }
  }, {
      $match: condition
    }, {
      $unwind: {
        path: "$paymentDetail",
        preserveNullAndEmptyArrays: true
      }
    }, {
      $sort: {
        "paymentDetail.expiryDate": -1
      }
    }, {
      $group: {
        _id: "$_id",
        firstname: {
          $first: "$firstname"
        },
        lastname: {
          $first: "$lastname"
        },
        isBlock: {
          $first: "$isBlock"
        },
        isEmailVerify: {
          $first: "$isEmailVerify"
        },
        createdAt: {
          $first: "$createdAt"
        },
        userAutoId: {
          $first: "$userAutoId"
        },
        expiryDate: {
          $first: "$paymentDetail.expiryDate"
        }
      }
    }).then(function (result) {
      console.log(result);
      callback(result);
    }).catch(function (err) {
      console.log("err", err);
      callback(err);
    })
}

/* This function return only userdetail and secrete token*/
userHelper.getManagerList = (condition, field, callback) => {
  userModel.aggregate({
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: 'enterpriseId',
      as: 'driversCount'
    }
  }, {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'user_id',
        as: 'paymentDetail'
      }
    }, {
      $match: condition
    }, {
      $project: {
        _id: 1,
        firstname: 1,
        lastname: 1,
        isBlock: 1,
        createdAt: 1,
        updatedAt: 1,
        userAutoId: 1,
        paymentDetail: 1,
        totalCount: {
          $size: "$driversCount"
        }
      }
    }, {
      $unwind: {
        path: "$paymentDetail",
        preserveNullAndEmptyArrays: true
      }
    }, {
      $sort: {
        "paymentDetail.expiryDate": -1
      }
    }, {
      $group: {
        _id: "$_id",
        firstname: {
          $first: "$firstname"
        },
        lastname: {
          $first: "$lastname"
        },
        isBlock: {
          $first: "$isBlock"
        },
        createdAt: {
          $first: "$createdAt"
        },
        userAutoId: {
          $first: "$userAutoId"
        },
        totalCount: {
          $first: "$totalCount"
        },
        expiryDate: {
          $first: "$paymentDetail.expiryDate"
        }
      }
    }).then(function (result) {
      console.log(result);
      callback(result);
    }).catch(function (err) {
      console.log("err", err);
      callback(err);
    })
}

userHelper.getUserToSendEmail = (condition, field, callback) => {
  let setLimit = 1;
  userModel.find(condition, field).limit(1).exec((err, user) => {
    if(user){
      if (user.length == 1 && !err) {
        console.log(err, user[0], user.length)
        callback(err, user[0]);
      }
    }
    

  });
}

userHelper.mailSentUpdateUser = (condition, field, callback) => {
  userModel.update(condition, field).exec((err, result) => {
    callback(err, result);
  })
}
module.exports = userHelper;