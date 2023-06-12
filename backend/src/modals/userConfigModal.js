'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WeeklyAllowanceSchema = new Schema({
	amount: {
		type: Number,
		default: 0
	},
	day: {
		type: String,
		enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
		default: 'friday'
	},
});

const LearningAllowanceSchema = new Schema({
	enabled: {
		type: Boolean,
		default: false
	},
	amount: {
		type: Number,
		default: 0
	},
});

const UserAccountSchema = new Schema({
	uid: {
		type: String,
		required: true
	},
	freeTrialUsed: {
		type: Boolean,
		required: true,
		default: false
	},
	physicalCardStatus: {
		type: String,
		required: false
	},
	cipStatus: {
		type: String,
		required: false
	},
	weeklyAllowance: WeeklyAllowanceSchema,
	learningAllowance: LearningAllowanceSchema,
	spendingAllocation: {
		type: Number,
		default: 70
	}
}, {
	timestamps: true,
});

const UserConfig = mongoose.model("UserConfig", UserAccountSchema);

module.exports = UserConfig;