const createAccountValidation = require("./createAccountValidation");
const orderCardValidation = require("./orderCardValidation");
const moveMoneyValidation = require("./moveMoneyValidation");
const enableRoundUpValidation = require("./enableRoundUpValidation");
const getAccountNumbersValidation = require("../admin/getAccountNumbersValidation");
const createGoalValidation = require("../goals/createGoalValidation")
const updateGoalValidation = require("../goals/updateGoalValidations")
const internationalAccessValidation = require("./internationalAccessValidation")
const lostCardValidation = require("./lostCardValidation");
const loadOwnerAdminWalletValidation = require("../admin/loadOwnerAdminWalletValidation");

module.exports = {
    createAccountValidation,
    orderCardValidation,
    moveMoneyValidation,
    enableRoundUpValidation,
    getAccountNumbersValidation,
    createGoalValidation,
    updateGoalValidation,
    internationalAccessValidation,
    lostCardValidation,
    loadOwnerAdminWalletValidation
};