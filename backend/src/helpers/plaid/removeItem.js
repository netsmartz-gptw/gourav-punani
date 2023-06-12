const plaidClient = require('../../controller/plaid/config')

const removeItem = async (access_token) => {

    const request = { access_token }

    try {
        return await plaidClient.itemRemove(request);
        // The Item was removed, access_token is now invalid
    } catch (error) {
        // handle error
        throw new Error(error)
    }

}
module.exports = removeItem