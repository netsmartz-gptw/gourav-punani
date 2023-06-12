const mongoose = require("mongoose");

const transactionEventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: false,
    }
},
    {
        timestamps: true,
        strict: false
    }

);

const transactionEvents = mongoose.model("transactionEvents", transactionEventSchema);

module.exports = transactionEvents;