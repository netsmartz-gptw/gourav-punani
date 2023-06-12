const app = require("../src/app"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const { cognitoLogin } = require("../src/helpers");
const mongoose = require("mongoose");

let accessToken;
beforeAll(async () => {
  const tokenData = await cognitoLogin();
  accessToken = tokenData.token.accessToken;
  return;
});

describe("should respond with 400 status code", () => {
  test("when access token is missing", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", "");
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when from account number is missing", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "wallet",
          accountNo: "",
        },
        to: {
          type: "wallet",
          accountNo: "",
        },
        amount: "500",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when from type is missing", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "",
          accountNo: "423101061350",
        },
        to: {
          type: "",
          accountNo: "423101061327",
        },
        amount: "500",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when ammount is missing", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "wallet",
          accountNo: "423101061350",
        },
        to: {
          type: "wallet",
          accountNo: "423101061327",
        },
        amount: "",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when sender wallet is not assosciated with project account ", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "wallet",
          accountNo: "423101061350",
        },
        to: {
          type: "wallet",
          accountNo: "423101061327",
        },
        amount: "500",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when from type is goal and to type is saving ", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "goal",
          accountNo: "1",
        },
        to: {
          type: "spending",
          accountNo: "1",
        },
        amount: "1",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });

  test("when from type i s spending and to type is goal ", async () => {
    const response = await request
      .post("/galileo/wallet/transfer")
      .set("accesstoken", accessToken)
      .send({
        from: {
          type: "spending",
          accountNo: "1",
        },
        to: {
          type: "goal",
          accountNo: "1",
        },
        amount: "1",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("response");
    expect(response.body.response).toHaveProperty("message");
  });
});

afterAll(() => mongoose.connection.close());
