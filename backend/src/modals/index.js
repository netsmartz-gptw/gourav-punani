const userAccount = require('./userAccountModal');
const galileoWebHook = require('./galileoWebHookModal');
const userConfig = require('./userConfigModal');
const notifications = require('./notificationsModal');
const transactionEvents = require('./transactionEventsModal');
const transactionLogs = require('./transactionLogs');

module.exports = {
	userAccount,
	galileoWebHook,
	userConfig,
	notifications,
	transactionEvents,
	transactionLogs
};
