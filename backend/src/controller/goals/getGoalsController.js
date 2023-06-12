const { pagination } = require("../../config/config")
const { ErrorHandler } = require("../../helpers")
const db = require("../../mysql/models")

const getGoalsController = async (req, res, next) => {

    try {

        const { uid } = req.body
        const { offset, limit, status } = req.query

        const { max_records: maxQueryLimit, min_records: minQueryLimit } = pagination

        const actualOffset = offset || 0
        const actualLimit = !limit ? minQueryLimit : limit > maxQueryLimit ? maxQueryLimit : limit < minQueryLimit ? minQueryLimit : limit;

        const where = {
            uid,
            closureStatus: 0
        }

        if (status == 'active') where.status = 0
        else if (status == 'inactive') where.status = 1

        const count = await db.goals.count({
            where
        })

        const goals = await db.goals.findAll({
            where,
            limit: parseInt(actualLimit),
            offset: parseInt(actualOffset),
        })

        return res.status(200).send({
            statusCode: 200,
            response: {
                total_records: count,
                data: goals,
                limit: actualLimit,
                offset: actualOffset,
            }
        })

    }
    catch (err) {
        return next(new ErrorHandler(500, null, null, err))
    }
}

module.exports = getGoalsController