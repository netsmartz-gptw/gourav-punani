const { REPORT_LOST_CARD } = require("../../config/messages")
const {
  ErrorHandler,
  jsonResponse,
  modifyCardStatus,
  updateGalileoAccount,
  setUserConfig,
  // getAccountCards,
} = require("../../helpers");
const {
  LOST_CARD_WITH_REPLACEMENT,
  LOST_CARD_WITHOUT_REPLACEMENT,
  USA_COUNTRY_CODE,
  LOST_WITHOUT_REPLACEMENT_STATUS,
  LOST_WITH_REPLACEMENT_STATUS
} = require("../../config/galileoConfig");
const db = require('../../mysql/models');

/**
* Used to report lost card
* 
* @param {Object} req 
* @param {Object} res 
* @param {Function} next 
* @returns {JSON}
*/
const reportLostCard = async (req, res, next) => {
  try {
      const { shippingAddress, withReplacement, childUid } = req.body;
      const childWallet = req.childWallet;

      const statusType = withReplacement ? LOST_CARD_WITH_REPLACEMENT : LOST_CARD_WITHOUT_REPLACEMENT;
      if (withReplacement) {
        const shipToAddress = {
          shipToAddress1: shippingAddress.streetAddress,
          shipToCity: shippingAddress.city,
          shipToState: shippingAddress.state,
          shipToPostalCode: shippingAddress.zip,
          shipToCountryCode: USA_COUNTRY_CODE,
          shipToAddressPermanent: 1
        };

        // UPDATE ADDRESS IN USER TABLE
        const userDetails = {
          streetAddress: shippingAddress.streetAddress ? shippingAddress.streetAddress.trim() : shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
        };

        await db.Users.update(userDetails, { where: { uid: childUid }});

        const updatedAddress = await updateGalileoAccount(childWallet?.pmt_ref_no, shipToAddress);
      }
      
      const featureResponse = await modifyCardStatus(childWallet?.pmt_ref_no, childWallet?.lastFourDigits, statusType);

      const physicalCardStatus = withReplacement ? LOST_WITH_REPLACEMENT_STATUS : LOST_WITHOUT_REPLACEMENT_STATUS;
      const updatedConfig = await setUserConfig(req, { physicalCardStatus }, childUid);

      return jsonResponse(res, 200, REPORT_LOST_CARD, featureResponse);

  } catch (error) {
      return next(new ErrorHandler(500, null, null, error))
  }
}

module.exports = reportLostCard;