const app = require("../src/app");
const connect = require("../src/connection");
const request = require("supertest");

var client;
var db;

beforeAll(async () => {
  ({db, client} = await connect());
  db.collection("users").deleteMany();
  app.setupRoutes(db);
});

afterAll(async () => {
  await client.close();
})

describe("Testing users", () => {
  it("should add new user", async (done) => {
    const res = await request(app).post("/users").send({
      firstName: "Salim",
      lastName: "Dirani",
      email: "salimdirani3@gmail.com",
      password: "45181Ni..",
    });
    expect(res.status).toBe(201);
    done();
  });
});
