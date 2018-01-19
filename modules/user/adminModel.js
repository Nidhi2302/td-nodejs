const mongoose = require('mongoose')
const Schema = mongoose.Schema

let schema = new Schema({
  name: { type: String },
  role: { type: String },
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: new Date() }
})

const Admin = mongoose.model('Admin', schema)

module.exports = Admin