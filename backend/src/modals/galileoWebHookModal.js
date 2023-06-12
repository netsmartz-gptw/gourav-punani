const mongoose = require("mongoose");

const galileoWebHookSchema = new mongoose.Schema({
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

const galileoWebHook = mongoose.model("galileoWebHook", galileoWebHookSchema);

module.exports = galileoWebHook;