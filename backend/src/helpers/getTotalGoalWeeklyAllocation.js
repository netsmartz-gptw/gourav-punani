const db = require("../mysql/models")
const { GOAL_NOT_FOUND } = require('../config/messages')

const getTotalGoalWeeklyAllocation = async (uid, autoFundPercentage) => {
    try {
        const maxWeeklyAllocation = 100
        // fetch weekly allocation (%) for child
        const goalData = await db.goals.findAll({
            where: {
                uid,
                status: 0                
            },
            attributes: ['uid', 'weeklyAllocation'],
        })
        console.log("goal data", goalData)
        if (!goalData) return true;

        const goalWeeklyAllocations = goalData.map((value) => {
            return value.dataValues.weeklyAllocation
        })

        // calculating weeklAllocation(%)

        const totalWeeklyAllocation = goalWeeklyAllocations.reduce((prevValue, currentValue) => {
            return prevValue + currentValue
        }, 0);

        const allowedAutoFundPercentage = maxWeeklyAllocation - totalWeeklyAllocation

        if (autoFundPercentage > allowedAutoFundPercentage) throw new Error(`Only ${allowedAutoFundPercentage}% is available to be set as auto fund percentage`)

        return true

    }
    catch (err) {
        throw err
    }

}

module.exports = getTotalGoalWeeklyAllocation