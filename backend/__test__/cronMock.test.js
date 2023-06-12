const {
	markChoresAsPaid
} = require('../src/helpers')
const mongoose = require('mongoose')
// const connectToMongo = require("../src/config/mongoConnection");
const mockAxios = require("axios");

jest.setTimeout(10000);
jest.mock("axios");


const childUid = process.env.JEST_CHILD_UID


describe("Mocking", () => {
	
	beforeEach(() => {
    mockAxios.put.mockResolvedValueOnce({ data: { statusCode: 200, message: 'Marked chore as paid' } });
	});
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});


	test("Mark chores as paid", async () => {
		const choreResponse = await markChoresAsPaid(null, ['62e26e19897eb70f449168fc']);
		console.log("choreResponse : ", choreResponse);
		expect(choreResponse).toEqual(expect.any(Object));
    expect(choreResponse.statusCode).toBe(200)
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
	});
});

afterAll(() => mongoose.connection.close());