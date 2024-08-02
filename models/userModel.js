const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    firstName: {type: String , required : true},
    lastName: {type: String , required : true},
    address: {type: String , required : true},
    phoneNumber: {type: Number , required : true},
    role: {type: String , required : true},
    establishment: {type: String },
    email: {type: String , required : true},
    password : {type: String , required : true},
    created_at : {type: Date, default: Date.now}


})

module.exports = mongoose.model("User", UserSchema)