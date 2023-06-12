const { goals, SERVER_ERROR } = require("../../config/messages")
const { ErrorHandler, jsonResponse } = require("../../helpers")
const db = require("../../mysql/models")

const markGoalCompleted = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { id } = req.params //goal id

        const goal = await db.goals.findOne({
            where: {
                uid,
                id
            },
        })
        if (!goal) return jsonResponse(res, 400, goals.NOT_EXIST)

        if (goal.dataValues.closureStatus) return jsonResponse(res, 400, goals.ALREADY_CLOSED)

        if (parseFloat(goal.dataValues.progressAmount) < parseFloat(goal.dataValues.goalAmount)) return jsonResponse(res, 400, goals.NOT_ENOUGH_MONEY_TO_COMPLETE)

        const result = await db.goals.update(
            { status: 1 },
            {
                where: {
                    uid,
                    id
                }
            }
        )
        if(!result[0]) return jsonResponse(res, 400, SERVER_ERROR)

        return jsonResponse(res, 200, goals.COMPLETED)
    }
    catch (err) {
        return next(new ErrorHandler(500, err.message, null, err))
    }
}
module.exports = markGoalCompleted