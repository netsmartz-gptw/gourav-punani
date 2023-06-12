const { SERVER_ERROR } = require("../../config/messages")
const { sequelize } = require("../../mysql/models")
const db = require("../../mysql/models")

const getGoalsProgressTotal = (uid) => {
    try{
        return db.goals.findOne({
            where: {
                uid,
                status: 0
            },
            attributes: [[sequelize.fn('sum', sequelize.col('progressAmount')), 'goalsTotal']]
        })
    }
    catch(err){
        console.log(err)
        throw new Error(SERVER_ERROR)
    }    
}

module.exports = getGoalsProgressTotal