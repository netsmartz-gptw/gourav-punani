const app = require("../src/app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const { cognitoLogin } = require('../src/helpers')
const mongoose = require('mongoose')
// const connectToMongo = require("../src/config/mongoConnection");

let accessToken;
beforeAll(async () => {
	// await connectToMongo().then(async () => console.log('connected to mongo'));
	const tokenData = await cognitoLogin();
	accessToken = tokenData.token.accessToken;
	return;
  });

describe("should respond with 400 status code", () => {
	test("when access token is missing", async () => {
		const response =  await request.get("/galileo/wallet/transfer").set('accesstoken','');
		expect(response.statusCode).toBe(400)
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
	});
}); 

describe("parent test cases", () => {
	test("Parent's access token is passed: should respond with 200 status code", async () => {
		const response =  await request.get("/galileo/wallet/transfer").set('accesstoken', accessToken);
		expect(response.statusCode).toBe(200)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
	});

});

afterAll(() => mongoose.connection.close());