const webhookAuth = require('./webhookAuth')
const auth = require('./auth')
const parentRole = require('./parentRole')
const getUser = require('./getUser')
const childRole = require('./childRole')
const authKey = require('./authKey')
const cardSettingsAuth = require('./cardSettingsAuth')
const ownerOrParentToChildSwitch = require('./ownerOrParentToChildSwitch')
const parentToOwnerSwitch = require('./parentToOwnerSwitch')
const allowedRoles = require('./allowedRoles')

module.exports = {
    webhookAuth,
    auth,
    parentRole,
    getUser,
    childRole,
    authKey,
    cardSettingsAuth,
    ownerOrParentToChildSwitch,
    parentToOwnerSwitch,
    allowedRoles
}
