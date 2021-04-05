const { MongoClient } = require("mongodb");
const { dbURL, dbName } = require("../config");

const client = new MongoClient(dbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

function connect() {
  return new Promise(async (resolve, reject) => {
    try {
      await client.connect();
      const db = client.db(dbName);
      const users = db.collection("users");
      users.createIndex({ email: 1 }, { unique: 1 });
      resolve({db, client});
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = connect;
