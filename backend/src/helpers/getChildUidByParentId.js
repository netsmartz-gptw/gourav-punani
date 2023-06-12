const db = require("../mysql/models");

/**
 * Fetch all children from parent uid
 * 
 * @param {String} parentUid 
 * @param {Array} selectChildParams 
 */
const getChildrenByParentUid = async (parentUid, selectChildParams) => {
	selectChildParams = selectChildParams || ['uid', 'firstName', 'lastName', 'profileImageUrl'];
	return await db.Users.findOne({
		where: { uid: parentUid },
		attributes: ['id'],
		include: {
			model: db.Users,
			as: 'children',
			attributes: selectChildParams
		}
	});
}

module.exports = getChildrenByParentUid;