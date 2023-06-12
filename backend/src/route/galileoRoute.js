const express = require('express')
const router = express.Router();

const {
  galileoDumpData,
  createAccount,
  walletInfo,
  orderChildCard,
  moveMoney,
  walletBalance,
  userAccounts,
  createToken,
  exchangePublicToken,
  viewVirtualCard,
  accountTransactions,
  readRDFFile,
  cardOverView,
  roundUpAmount,
  getAccountNumbersController,
  getAccountBalanceController,
  createGoalController,
  getGoalsController,
  editGoalController,
  deleteGoalController,
  markGoalCompleted,
  updateInternationalAccess,
  fetchCardSettings,
  lockUnlockCard,
  reportLostCard,
  listFundingSources,
  deleteFundingSource,
  setFundingSourceAsPrimaryController,
  autoReloadWalletController,
  dailySpendingLimitController,
  loadAdminWalletController,
} = require('../controller')
const {
  webhookAuth,
  auth,
  getUser,
  authKey,
  cardSettingsAuth,
  parentToOwnerSwitch,
  ownerOrParentToChildSwitch,
  allowedRoles
} = require('../middleware')
const {
  createAccountValidation,
  orderCardValidation,
  moveMoneyValidation,
  enableRoundUpValidation,
  getAccountNumbersValidation,
  createGoalValidation,
  updateGoalValidation,
  internationalAccessValidation,
  lostCardValidation,
  loadOwnerAdminWalletValidation,
} = require('../middleware/validation');
const { activatePhysicalCard, physicalCardPinChange, getCardPinToken, assessFee } = require('../helpers');
const getCard = require('../helpers/getCardHelper');
const CommitPinChanges = require('../helpers/commitPinChangesHelper');
const getRoundUpAccounts = require('../controller/getRoundUpAccountsController');
const setAsPrimaryFundingSourceValidation = require('../middleware/setAsPrimaryFundingSourceValidation');
const autoReloadWalletValidation = require('../middleware/autoReloadWalletValidation');
const { roles: { admin: adminRole, parent: parentRole, child: childRole } } = require('../config/config');


// router.use(auth)
router.post('/events', webhookAuth, galileoDumpData)
router.post('/events/AccountEvent', galileoDumpData)
router.post('/events/Authorization', galileoDumpData)
router.post('/events/Settlement', galileoDumpData)
router.post('/events/Transaction', webhookAuth, galileoDumpData)


router.post('/account', createAccountValidation, auth, allowedRoles([adminRole]), createAccount)
router.post('/wallet/transfer', moveMoneyValidation, auth, ownerOrParentToChildSwitch, getUser, moveMoney)
router.get('/wallet/transfer', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, userAccounts)
router.post('/orderCard', orderCardValidation, auth, parentToOwnerSwitch, allowedRoles([adminRole, parentRole]), orderChildCard)
// router.post('/getBalance', auth, walletInfo)
router.get('/card/overview', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, cardOverView)
router.get('/wallet', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, walletInfo)
router.get('/wallet/balance', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, walletBalance)
router.get('/accounts/:accountType/transactions', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, accountTransactions)
router.get('/card/virtual', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, viewVirtualCard)

// DEPRECIATED
router.post('/createAccount', createAccountValidation, auth, allowedRoles([adminRole]), createAccount)
router.get('/moveMoneyDropdown', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, userAccounts)
router.post('/moveMoney', moveMoneyValidation, auth, ownerOrParentToChildSwitch, getUser, moveMoney)
router.get('/viewVirtualCard', auth, ownerOrParentToChildSwitch, viewVirtualCard)

router.get('/cardOverview', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), cardOverView)
router.post('/activatePhysicalCard', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, activatePhysicalCard)
router.get('/cards', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, getCard)


router.get('/RDFFile', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, readRDFFile)


// plaid + galileo routes
router.post('/plaid/createToken', auth, allowedRoles([adminRole]), createToken)
router.post('/plaid/processPublicToken', auth, allowedRoles([adminRole]), exchangePublicToken)
// router.post('/plaid/generateSandboxPublicToken',auth, allowedRoles([adminRole, parentRole]), generatePublicToken)

router.get('/roundUp', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, getRoundUpAccounts)
router.post('/enableRoundUpAmount', enableRoundUpValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, roundUpAmount)

// goals endpoints
router.get('/goals', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([childRole]), getGoalsController)
router.post('/goal', createGoalValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([childRole]), createGoalController)
router.put('/goal/:id', updateGoalValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([childRole]), editGoalController)
router.put('/goal/:id/markAsCompleted', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([childRole]), markGoalCompleted)
router.delete('/goal/:id', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([childRole]), deleteGoalController)

// CARD SETTINGS
router.get('/cardSettings/:childuid', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), fetchCardSettings);
router.put('/cardSettings/international/:status', internationalAccessValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), cardSettingsAuth, updateInternationalAccess);
router.put('/cardSettings/lock/:status', internationalAccessValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), cardSettingsAuth, lockUnlockCard);
router.put('/cardSettings/lost', lostCardValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), cardSettingsAuth, reportLostCard);
router.get('/cardSettings/pin/token', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, getCardPinToken)
router.post('/cardSettings/pin/commitPinChanges', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, CommitPinChanges)
router.post('/cardSettings/dailySpendingLimit', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), dailySpendingLimitController)


// admin endpoints
router.get('/admin/parent/accountNumbers', getAccountNumbersValidation, authKey, getAccountNumbersController)
router.get('/admin/parent/accountBalances', authKey, getAccountBalanceController)
router.post('/admin/owenerAdmin/loadWallet', loadOwnerAdminWalletValidation, authKey, loadAdminWalletController)


// funding Sources
router.get('/fundingSources', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), listFundingSources)
router.delete('/fundingSource/:id', auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), deleteFundingSource)
router.put('/fundingSource/:id/primary', setAsPrimaryFundingSourceValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), setFundingSourceAsPrimaryController)

// auto load wallet configuration
router.post('/autoReloadWalletConfig', autoReloadWalletValidation, auth, parentToOwnerSwitch, ownerOrParentToChildSwitch, allowedRoles([adminRole, parentRole]), autoReloadWalletController)

module.exports = router