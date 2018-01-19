let express = require('express');
let bodyParser = require('body-parser');
let app = express.Router();
app.use('/api/v1/user', require('./modules/user/userRoute'));
app.use('/api/v1/list', require('./modules/listing/listingRoute'));
app.use('/api/v1/book', require('./modules/booking/bookingRoute'));
app.use('/api/v1/report', require('./modules/report/reportRoute'));
app.use('/api/v1/payment', require('./modules/payment/paymentRoute'));
app.use('/api/v1/feedback', require('./modules/feedback/feedbackRoute'));
app.use('/api/v1/notification', require('./modules/notification/notificationRoute'));
app.all('/*', function (req, res) {
    return errorUtil.notFound(res, req);
});
module.exports = app;
