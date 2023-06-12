const { SERVER_ERROR } = require("../../config/messages")

const fetchGoalsByUid = (uid) => {
    try{
        return db.goals.find({
            where: {
                uid,
                status: 0
            }
        })
    }
    catch(err){
        throw new Error(SERVER_ERROR)
    }
}
module.exports = fetchGoalsByUid