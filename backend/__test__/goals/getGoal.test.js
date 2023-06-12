const app = require("../../src/app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const { cognitoLogin } = require('../../src/helpers')
const mongoose = require('mongoose')
const connectToMongo = require("../../src/config/mongoConnection");



let accessToken,childAccessToken;
beforeAll(async () => {
	// await connectToMongo().then(async () => console.log('connected to mongo'));
    const tokenData= await cognitoLogin(null,process.env.JEST_COGNITO_LOGIN_USERNAME,process.env.JEST_COGNITO_LOGIN_PASSWORD);
    const childTokenData = await cognitoLogin(null,process.env.JEST_CHILD_USERNAME, process.env.JEST_CHILD_PASSWORD);
    accessToken = tokenData.token.accessToken
    childAccessToken = childTokenData.token.accessToken
  });

  describe("get goals : should respond with 400 status code", () => {
	test("when access token is missing", async () => {
		const response =  await request.get("/galileo/goals").query({status : 'inactive'}).set('accesstoken','');
		expect(response.statusCode).toBe(400)
		expect(response.body).toHaveProperty('response')
		expect(response.body.response).toHaveProperty('message')
	});
}); 

describe("get goal: should respond with 403 status code", () => {
	test("without child uid", async () => {
		const response =  await request.get("/galileo/goals").query({status : 'active'}).set('accesstoken', accessToken);
		expect(response.statusCode).toBe(403)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
		expect(response.body.response).toHaveProperty('message')
        expect(response.body.response).toHaveProperty('code')
        expect(response.body.response.code).toBe('FORBIDDEN_ACCESS');
	});
	test(" inavlid childuid", async () => {
		const childUid = 'dae7a7ce-0576-4cd4-8a45-b644396aba88';
		const response =  await request.get("/galileo/goals").query({status : 'active'}).set('accesstoken', accessToken).set('childuid', childUid);
		expect(response.statusCode).toBe(403)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
		expect(response.body.response).toHaveProperty('code');
		expect(response.body.response.code).toBe('ForbiddenAccessException');
	});
})

describe("get goal: should respond with 200 status code", () => {
	test(" valid childuid and status active", async () => {
		const childUid = process.env.JEST_CHILD_UID;
		const response =  await request.get("/galileo/goals").query({status : 'active'}).set('accesstoken', accessToken).set('childuid', childUid);
		expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.response.data)).toBe(true)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
	});
	test(" valid childuid and status inactive", async () => {
		const childUid = process.env.JEST_CHILD_UID;
		const response =  await request.get("/galileo/goals").query({status : 'inactive'}).set('accesstoken', accessToken).set('childUid', childUid);
		expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.response.data)).toBe(true)
		expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
		expect(response.body).toHaveProperty('statusCode');
		expect(response.body).toHaveProperty('response');
	});
})

// afterAll(() => mongoose.connection.close());