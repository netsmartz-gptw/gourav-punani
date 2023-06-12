const Joi = require('joi')
const  { goal_allocation_step }  = require("../../config/config")

const updateGoalsSchema = Joi.object({
    fields: Joi.object().required().keys({
        title: Joi.string().required(),
        weeklyAllocation: Joi.number().integer().min(0).max(100).multiple(goal_allocation_step).default(0),
    })
})

module.exports = updateGoalsSchema