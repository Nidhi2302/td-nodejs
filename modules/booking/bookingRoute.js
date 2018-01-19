//Dependencies 
let express = require('express');
let bookingCtr = require('./bookingController.js');
let bookingMiddleware = require('./bookingMiddleware.js');
let auth = require("../../helper/auth");
let bookingRouter = express.Router();

let bookASpaceMiddleware = [auth.checkToken, bookingMiddleware.validateInput("bookASpace"), bookingCtr.bookASpace];
bookingRouter.post('/book-a-space', bookASpaceMiddleware);

let bookingList = [auth.checkToken,bookingCtr.bookingList];
bookingRouter.post('/booking-history', bookingList);

let bookingListAll = [auth.checkToken,bookingCtr.bookingListAll];
bookingRouter.post('/all-booking-history', bookingListAll);

let managerBookingList = [auth.checkToken,bookingCtr.managerBookingList];
bookingRouter.post('/manager-booking-history', managerBookingList);

let driverStatus = [auth.checkToken,bookingCtr.driverStatus];
bookingRouter.get('/driver-status', driverStatus);


module.exports = bookingRouter;