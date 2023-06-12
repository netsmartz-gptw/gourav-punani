const app = require("../src/app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const { cognitoLogin } = require('../src/helpers')
const mongoose = require('mongoose')
// const connectToMongo = require("../src/config/mongoConnection");

jest.setTimeout(10000);

let accessToken;
beforeAll(async () => {
	// await connectToMongo().then(async () =>j console.log('connected to mongo'));
	const tokenData = await cognitoLogin();
	accessToken = tokenData.token.accessToken;
	return;
  });
describe("should respond with 400 status code", () => {
	test("when access token is missing", async () => {
		const response =  await request.get("/galileo/card/virtual").set('accesstoken','');
		expect(response.statusCode).toBe(400)
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
	});
}); 

describe("parent test cases", () => {
	test("Parent's access token without childuid: should respond with 200 status code", async () => {
		const response =  await request.get("/galileo/card/virtual").set('accesstoken', accessToken);
		expect(response.statusCode).toBe(200)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
		expect(response.body.response).toHaveProperty('imageUrl');
	});

});

describe("Child test cases", () => {
	test(" INVALID childuid: should respond with 403 status code", async () => {
		const childUid = 'dae7a7ce-0576-4cd4-8a45-b644396aba88';
		const response =  await request.get("/galileo/card/virtual").set('accesstoken', accessToken).set('childUid', childUid);
		expect(response.statusCode).toBe(403)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
		expect(response.body.response).toHaveProperty('code');
		expect(response.body.response.code).toBe('ForbiddenAccessException');
	});
	test(" VALID childuid: should respond with 200 status code", async () => {
		const childUid = process.env.JEST_COGNITO_CHILD_UID;
		const response =  await request.get("/galileo/card/virtual").set('accesstoken', accessToken).set('childUid', childUid);
		expect(response.statusCode).toBe(200)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
		expect(response.body.response).toHaveProperty('imageUrl');
	});
});

afterAll(() => mongoose.connection.close());