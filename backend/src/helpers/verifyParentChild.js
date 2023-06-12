const db = require("../mysql/models");

/**
 * Verify child is of valid parent
 * 
 * @param {String} childUid 
 * @param {String} parentUid 
 * @returns {Object}
 */
const verifyParentChild = async (childUid, parentUid) => {
    const user = await db.Users.findOne({
        where: { uid: childUid },
        attributes: ['id', 'uid', 'firstName', 'lastName', 'email', 'dob', 'phoneNo'],
        include: {
            model: db.Users,
            as: 'parent',
            where: { uid: parentUid },
            attributes: ['id', 'uid'],
            required: true
        },
        logging: false
    });
    return user;
};

module.exports = verifyParentChild;