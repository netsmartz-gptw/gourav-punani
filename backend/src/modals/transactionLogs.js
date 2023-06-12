const mongoose = require("mongoose");

const transactionLogsSchema = new mongoose.Schema(
    {
        sourceUid: {
            type: String,
            required: false,
        },
        fromUid: {
            type: String,
            required: false,
        },
        toUid: {
            type: String,
            required: false,
        },
        fromAc: {
            type: String,
            required: false,
        },
        toAc: {
            type: String,
            required: false,
        },
        fromAcType: {
            type: String,
            required: false,
        },
        toAcType: {
            type: String,
            required: false,
        },
        amount: {
            type: Number,
            required: false,
        },
        date: {
            type: Date,
            default: Date.now,
            required: false,
        },
        IP: {
            type: String,
            required: false,
        },
        geoLocation: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        deviceType: {
            type: String,
            required: false,
        },
        deviceId: {
            type: String,
            required: false,
        },
        deviceName: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        tags: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        strict: false
    }

);

const transactionLogs = mongoose.model("transactionLogs", transactionLogsSchema);

module.exports = transactionLogs;