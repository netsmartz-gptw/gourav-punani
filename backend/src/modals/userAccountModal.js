'use strict';

const mongoose = require("mongoose");

const UserAccountSchema = new mongoose.Schema({
	uid: { type: String, required: true },
	pmt_ref_no: { type: String },
	product_id: { type: String },
	galileo_account_number: { type: String },
	cip: { type: String },
	card_id: { type: String },
	card_number: { type: String },
	expiry_date: { type: String },
	card_security_code: { type: String },
	emboss_line_2: { type: String },
	billing_cycle_day: { type: String },
	transactionId: { type: String },
	rtoken: { type: String },
	accountType: {
		type: String,
		required: true,
		enum: ['primary', 'fundingSource', 'saving', 'spending']
	},
	accountStatus: { type: String, required: false, enum: ['primary', 'secondary'] }
}, {
	timestamps: true,
	strict: false
});

const UserAccount = mongoose.model("userAccount", UserAccountSchema);

module.exports = UserAccount;