const app = require('../src/app'); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);



describe("Plaid Token Test Cases", () => {
    test("should respond with a 200 status code when correce info is passed", async () => {
        const response = await request.post("/users/changePassword").set('accesstoken', token).send({
            PreviousPassword: "Admin@123",
            ProposedPassword: "Test@456"

        })
        expect(response.statusCode).toBe(200)
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
})