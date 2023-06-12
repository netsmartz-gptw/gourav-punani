const {
	getUserConfig,
	fetchGoals,
	getUnpaidChores,
	fetchLearningTransactions,
} = require('../src/helpers')
const mongoose = require('mongoose')
// const connectToMongo = require("../src/config/mongoConnection");


const childUid = process.env.JEST_CHILD_UID;

/* describe("should respond with Error", () => {
	test("Fetch user configuration with Error", async () => {
		// const userConfigs = await getUserConfig(null)
		expect(getUserConfig()).rejects.toThrow(TypeError);
	});
}); */


test("Fetch user configuration", async () => {
	const userConfigs = await getUserConfig(null, childUid)
	expect(userConfigs).toEqual(expect.any(Array));
});

test("Fetch user's active goals", async () => {
	const activeGoals = await fetchGoals(childUid, false)
	expect(activeGoals).toEqual(expect.any(Array));
});

test("Fetch user's unpaid chores", async () => {
	const unpaidChores = await getUnpaidChores(null, childUid);
	expect(unpaidChores).toEqual(expect.any(Array));
});

test("Fetch user's unpaid learning transaction", async () => {
	const learningTransactions = await fetchLearningTransactions(null, { uid: childUid, isPaid: false });
	expect(learningTransactions).toEqual(expect.any(Array));
});



afterAll(() => mongoose.connection.close());