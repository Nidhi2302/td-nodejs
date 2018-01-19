let mongoose = require('mongoose');

let bookingSchema = new mongoose.Schema({
  listingId: {
    type: String
  },
  bookingId: {
    type: String,
    default: '0'
  },
  listedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  bookedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

bookingSchema.pre('save', function(next) {
  let that = this
  if (that.bookingId == 0) {
    booking.find({}, function(error, counters) {
      var digit = counters.length.toString().length;
      var addZero = '';
      for (var i = 0; i <= 5 - digit; i++) {
        addZero += '0';
      }
      that.bookingId = "BK"+addZero + (+counters.length + 1)
      next()
    })
  } else {
    next()
  }
})

let booking = mongoose.model('booking', bookingSchema);
module.exports = booking;