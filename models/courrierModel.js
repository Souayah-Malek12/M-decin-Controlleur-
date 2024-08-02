const mongoose = require("mongoose");

const traceabilitySchema = new mongoose.Schema({
    action: {type: String , required: true},
    date : {type: Date,  required: true },
    user : {type: String, required: true}
});

const courrierSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver : { type: String, required: true},
    subject: {type: String, required: true},
    content : {type: String},
    status: {type: String, default: 'Non-Traité'},
    receivedDate : {type: Date , default: Date.now},
    traceability : {type: [traceabilitySchema]}
});



module.exports = mongoose.model('Courrier', courrierSchema);

