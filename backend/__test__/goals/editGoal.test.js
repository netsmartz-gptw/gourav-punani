const app = require("../../src/app")
const supertest = require("supertest")
const { cognitoLogin } = require("../../src/helpers")
const request = supertest(app)

jest.setTimeout(50000)
let accessToken,childAccessToken;
beforeAll(async () => {
   
    const tokenData= await cognitoLogin(null,process.env.JEST_COGNITO_LOGIN_USERNAME,process.env.JEST_COGNITO_LOGIN_PASSWORD);
    const childTokenData = await cognitoLogin(null,process.env.JEST_CHILD_USERNAME, process.env.JEST_CHILD_PASSWORD);
    accessToken = tokenData.token.accessToken
    childAccessToken = childTokenData.token.accessToken

});

describe("edit goal :should respond with 400 status code", () => {
    const childUid = process.env.JEST_CHILD_UID
    test("when access token is missing", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken','').set('childuid',childUid).send({
            fields:{
                title: "update title",
                weeklyAllocation: 10
            }
        })
        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
    test("weekly allocation can't be greater than 100", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken',accessToken).set('childuid',childUid).send({
            fields:{
                title: "update title",
                weeklyAllocation: 200
            }
        })
        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
    test("when payload is not provided", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken',accessToken).set('childuid',childUid).send({})
        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
    test("with improper payload", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken',accessToken).set('childuid',childUid).send({
            fields:{
                weeklyAllocation: 20
            }
        })
        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
    test("weekly allocation should be multiple of 5", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken',accessToken).set('childuid',childUid).send({
            fields:{
                title: "update title",
                weeklyAllocation: 24
            }
        })
        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
    
});



describe("edit goal: should respond with 403 status code", () => {
    test("without child uid", async () => {
        const response =  await request.put("/galileo/goal/11").set('accesstoken', accessToken).send({
           fields:{
            title: "update title",
            weeklyAllocation: 10
           }
        })
        expect(response.statusCode).toBe(403)
        expect(response.body).toHaveProperty('statusCode')
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
        expect(response.body.response).toHaveProperty('code')
        expect(response.body.response.code).toBe('FORBIDDEN_ACCESS')

    });
    test(" inavlid childuid", async () => {
        const childUid = 'dae7a7ce-0576-4cd4-8a45-b644396aba88';
        const response =  await request.put("/galileo/goal/11").set('accesstoken', accessToken).set('childuid', childUid).send({
            fields:{
                title: "update title",
                weeklyAllocation: 10
            }
        });
        expect(response.statusCode).toBe(403)
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('response');
        expect(response.body.response).toHaveProperty('code');
        expect(response.body.response.code).toBe('ForbiddenAccessException');
    });
});


describe("edit goal: should respond with 200 status code", () => {
    test("with child uid", async () => {
        const childUid = process.env.JEST_CHILD_UID
        const response =  await request.put("/galileo/goal/11").set('accesstoken', accessToken).set('childuid', childUid).send({
            fields:{
                title: "update title",
                weeklyAllocation: 10
            }
        });
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('statusCode')
        expect(response.body).toHaveProperty('response')
        expect(response.body.response).toHaveProperty('message')
    });
   
});