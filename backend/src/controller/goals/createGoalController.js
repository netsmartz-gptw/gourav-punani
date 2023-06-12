const { GOAL_CREATED, GOAL_NOT_CREATED, ERROR_GOAL_COUNT } = require("../../config/messages")
const { ErrorHandler, getTotalGoalWeeklyAllocation, jsonResponse } = require("../../helpers")
const db = require("../../mysql/models")


const createGoalController = async (req, res, next) => {

    try {

        const { uid, title, goalAmount, weeklyAllocation } = req.body
        const goalAmt = goalAmount.toFixed(2)
        const goalWeeklyAlloc = weeklyAllocation ? weeklyAllocation : 0

        // to check goals count , for child there can't be more than 10 goals
        const goalsCount = await db.goals.count({
            where: {
                uid,
                status: 0
            }
        });
     
        if( goalsCount == 10) return next(new ErrorHandler(400, ERROR_GOAL_COUNT));

        // fetch true or false if goal weekly allocation can be done
        try {
            await getTotalGoalWeeklyAllocation(uid, goalWeeklyAlloc)
        }
        catch (err) {
            return jsonResponse(res, 400, err.message)
        }

        const response = await db.goals.create({ uid, title, goalAmount: goalAmt, weeklyAllocation: goalWeeklyAlloc })

        return jsonResponse(res, 200, GOAL_CREATED, response.dataValues)
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = createGoalController