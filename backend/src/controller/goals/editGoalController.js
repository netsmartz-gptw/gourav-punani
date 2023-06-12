const { ErrorHandler, getTotalGoalWeeklyAllocation, jsonResponse } = require("../../helpers")
const db = require("../../mysql/models")
const { GOAL_UPDATED, GOAL_NOT_UPDATED, goals } = require("../../config/messages")

const editGoalController = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { id } = req.params

        const editableFiedls = ['title', 'weeklyAllocation', 'goalAmount']
        const fields = Object.keys(req.body.fields)
        if (!fields.length) return jsonResponse(res, 400, goals.invalid_field)

        const isExist = fields.every(field => editableFiedls.includes(field))
        if (!isExist) return jsonResponse(res, 400, goals.invalid_field)

        const weeklyAllocation = req.body.fields.weeklyAllocation ? req.body.fields.weeklyAllocation : 0
        // if( weeklyAllocation % 10 != 0) return next(new ErrorHandler(400,'incorrect weekly allocation'));

        const goalWeeklyAllocation = await getTotalGoalWeeklyAllocation(uid, weeklyAllocation)
        if (goalWeeklyAllocation) {
            const result = await db.goals.update({ ...req.body.fields }, {
                where: {
                    uid,
                    id
                }
            })

            if (!result[0]) return jsonResponse(res, 400, GOAL_NOT_UPDATED)
            return res.status(200).send({
                statusCode: 200,
                response: {
                    message: GOAL_UPDATED
                }
            })
        } else {
            return jsonResponse(res, 400, GOAL_NOT_UPDATED)
        }
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = editGoalController