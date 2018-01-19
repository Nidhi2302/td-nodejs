let mongoose = require('mongoose');

let feedbackSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    organization: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    message: {
        type: String
    },
    created: {
        type: Date,
        default: new Date()
    },

});

let feedback = mongoose.model('feedback', feedbackSchema);
module.exports = feedback;