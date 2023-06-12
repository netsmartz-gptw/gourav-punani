const { goals } = require("../../config/messages")
const { ErrorHandler, jsonResponse } = require("../../helpers")
const db = require("../../mysql/models")

const deleteGoalController = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { id } = req.params //goal id

        const result = await db.goals.destroy({
            where: {
                uid,
                id
            }
        })
        if(!result) return jsonResponse(res, 400, goals.delete_error)
        
        return jsonResponse(res, 200, goals.delete_success)
    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }

}

module.exports = deleteGoalController