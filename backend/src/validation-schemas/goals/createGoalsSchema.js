const Joi = require('joi')
const  { goal_allocation_step }  = require("../../config/config")

const createGoalsSchema = Joi.object({
    title: Joi.string().required(),
    goalAmount: Joi.number().greater(0).required(),
    weeklyAllocation: Joi.number().integer().min(0).max(100).multiple(goal_allocation_step).default(0),
})

module.exports = createGoalsSchema