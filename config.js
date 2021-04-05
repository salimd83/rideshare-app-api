require("dotenv").config();

let dbName = process.env.MONGODB_DB_NAME;
let port = process.env.PORT;
if(process.env.NODE_ENV === 'test') {
    dbName = process.env.MONGODB_DB_NAME_TEST;
    port = 3002;
}

module.exports = {
  port,
  dbURL: process.env.MONGODB_URL,
  dbName,
};
