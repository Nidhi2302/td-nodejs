var mongoose = require('mongoose');
mongoose.connect('mongodb://'+process.env.DATABASEURL+':'+process.env.DATABSEPORT+'/'+process.env.DATABASE_DEV);
mongoose.connection.on('error', function (err) {
	console.log(err);
    console.log("Could not connect server....");
});