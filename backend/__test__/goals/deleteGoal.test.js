const app = require("../../src/app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const { cognitoLogin } = require('../../src/helpers')

const db = require("../../src/mysql/models")

// jest.mock("../../src/controller/goals/deleteGoalController")

jest.setTimeout(50000)
let accessToken,childAccessToken;

beforeAll(async () => {
	
	// await connectToMongo().then(async () => console.log('connected to mongo'));
    const tokenData= await cognitoLogin(null,process.env.JEST_COGNITO_LOGIN_USERNAME,process.env.JEST_COGNITO_LOGIN_PASSWORD);
    const childTokenData = await cognitoLogin(null,process.env.JEST_CHILD_USERNAME, process.env.JEST_CHILD_PASSWORD);
    accessToken = tokenData.token.accessToken
    childAccessToken = childTokenData.token.accessToken
  });

  	describe("delete goal: should respond with 400 status code", () => {
		test("when access token is missing", async () => {
			const response =  await request.delete("/galileo/goal/8").set('accesstoken','');
			// deleteGoal.mockResolvedValue(res)
			expect(response.statusCode).toBe(400)
			expect(response.body).toHaveProperty('response')
			expect(response.body.response).toHaveProperty('message')
		});
	}); 

	describe("delete goal: should respond with 200 status code", () => {
		test("mocking", async () => {
			const goalResponse = {
				"statusCode": 200,
				"response": {
					"message": "Goal deleted successfully"
				}
			}
			jest.spyOn(db.goals,"destroy").mockReturnValueOnce(goalResponse)
			expect(goalResponse.statusCode).toBe(200)
		})
	})	
 
	
	describe("delete goal: should respond with 403 status code", () => {
		test("without childuid", async () => {
			const response =  await request.delete("/galileo/goal/8").set('accesstoken', accessToken);
			expect(response.statusCode).toBe(403)
			expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
			expect(response.body).toHaveProperty('statusCode');
			expect(response.body).toHaveProperty('response');
			expect(response.body.response.code).toBe('FORBIDDEN_ACCESS');
		});
		test(" inavlid childuid", async () => {
			const childUid = 'dae7a7ce-0576-4cd4-8a45-b644396aba88';
			const response =  await request.delete("/galileo/goal/8").set('accesstoken', accessToken).set('childuid', childUid);
			expect(response.statusCode).toBe(403)
			expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
			expect(response.body).toHaveProperty('statusCode');
			expect(response.body).toHaveProperty('response');
			expect(response.body.response).toHaveProperty('code');
			expect(response.body.response.code).toBe('ForbiddenAccessException');
		});
	});
