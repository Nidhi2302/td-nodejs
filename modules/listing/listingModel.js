let mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

let listingSchema = new mongoose.Schema({
  listingId: {
    type: String,
    default: '0'
  },
  listedUserId: {
    type: ObjectId,
    ref: 'users'
  },
  location: {
    type: [Number],
    index : '2dsphere'
},
  address: {
    type: String,
  },
  available: {
    type: Date
  },
  description: {
    type: String
  },
  max_vehicle_size: {
    type: String
  },
  expired:{
    type:Boolean,
    default:false

  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
});

listingSchema.pre('save', function (next) {
  let that = this
  if (that.listingId == '0') {
    listing.find({}, function (error, counters) {
      var digit = counters.length.toString().length;
      var addZero = '';
      for (var i = 0; i <= 5 - digit; i++) {
        addZero += '0';
      }
      that.listingId = "LI" + addZero + (+counters.length + 1)
      next()
    })
  } else {
    next()
  }
})

let listing = mongoose.model('listing', listingSchema);
module.exports = listing;