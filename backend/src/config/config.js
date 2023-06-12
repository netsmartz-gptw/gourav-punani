module.exports = {
	SERVER_TIME_ZONE: 'America/Los_Angeles',
	apiurls: {
		createNotifications: {
			url: 'admin/notifications',
			method: 'post'
		}
	},
	notifications: {
		child_transaction: {
			type: 'child_transaction',
			description: (amount, child_name) => `New transaction for $${amount} made by ${child_name}`,
			title: 'Child Account transaction'
		},
		goal_completion: {
			type: 'goal_completion',
			title: 'Goal completed',
			description: (goalName, amount) => `Your goal ${goalName} has been completed with amount $${amount}`,
		},
	},
	chunk_size: 100,
	goal_allocation_step: 5,
	pagination: {
		max_records: 100,
		min_records: 10
	},
	defaultMoodleLesson: 1.1,
	roles: {
		admin: "admin",
		parent: "parent",
		child: "child"
	},
	userMiddlewareFields: ['id', 'roleId', 'familyId', 'email', 'username', 'uid']
};