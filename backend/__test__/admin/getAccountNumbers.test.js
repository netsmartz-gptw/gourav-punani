const app = require("../../src/app"); // Link to your server file
const supertest = require("supertest");
// const connectToMongo = require("../../src/config/mongoConnection");
const mongoose = require('mongoose')
const request = supertest(app);

beforeAll(async () => {
	// await connectToMongo().then(async () => console.log('connected to mongo'));
});

describe("get account number test cases", () => {
	test("should response with 200 when proper format payload is provided", async () => {
		const response = await request.get("/galileo/admin/parent/accountNumbers").set('apikey', process.env.NODE_API_KEY).send(
			{
				"uids": [
					"9e870f86-c85c-40aa-aa03-15b7e2a2db6a",
					"a2e62e11-8eb9-4570-aa6c-fe859129ea24"
				]
			}
		)
		expect(Array.isArray(response.body)).toBe(true)
		expect(response.body.length).toBe(2)
		expect(response.body[0]).toHaveProperty('uid')
		expect(response.body[0]).toHaveProperty('accountNo')
		expect(response.body[1]).toHaveProperty('uid')
		expect(response.body[1]).toHaveProperty('accountNo')
	});

	test("should response with 400 when no payload is not provided", async () => {
		const response = await request.get("/galileo/admin/parent/accountNumbers").set('apikey', process.env.NODE_API_KEY)
		expect(response.body).toHaveProperty('statusCode')
		expect(response.body.statusCode).toBe(400)
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
	});

	test("should response with 400 when no uids have no object", async () => {
		const response = await request.get("/galileo/admin/parent/accountNumbers").set('apikey', process.env.NODE_API_KEY).send(
			{
				"uids": [
				]
			}
		)
		expect(response.body).toHaveProperty('statusCode')
		expect(response.body.statusCode).toBe(400)
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
	});

	test("should response with 400 when api key is not provided", async () => {
		const response = await request.get("/galileo/admin/parent/accountNumbers")
		expect(response.body).toHaveProperty('statusCode')
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
		expect(response.body.response).toHaveProperty('code')
	});
});

afterAll(() => mongoose.connection.close());