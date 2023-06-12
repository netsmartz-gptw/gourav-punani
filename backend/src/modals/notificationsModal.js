'use strict';

const mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema({
	uid: { type: String, required: true },
	message: { type: String },
}, {
	timestamps: true,
	strict: false
});

const Notifications = mongoose.model("Notifications", NotificationsSchema);

module.exports = Notifications;