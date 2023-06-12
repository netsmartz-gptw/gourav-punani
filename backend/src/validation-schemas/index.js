const createAccountSchema = require('./createAccountSchema');
const orderCardSchema = require('./orderCardSchema');
const enableRoundUp = require('./enableRoundUpSchema');
const getAccountNumberSchema = require('./admin/getAccountNumberSchema');
const createGoalsSchema = require('./goals/createGoalsSchema')
const updateGoalsSchema = require('./goals/updateGoalsSchema')
const updateInternationalAccessSchema = require('./cardSettings/updateInternationalAccessSchema')
const lostCardSchema = require('./cardSettings/lostCardSchema')
const setAsPrimaryFundingSourceSchema = require('./setAsPrimaryFundingSourceSchema');
const ownerAdminLoadWalletSchema = require('./admin/ownerAdminLoadWalletSchema');

module.exports = {
    createAccountSchema,
    orderCardSchema,
    enableRoundUp,
    getAccountNumberSchema,
    createGoalsSchema,
    updateGoalsSchema,
    updateInternationalAccessSchema,
    setAsPrimaryFundingSourceSchema,
    lostCardSchema,
    ownerAdminLoadWalletSchema
};
