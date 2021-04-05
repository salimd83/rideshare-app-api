const { port } = require("../config");
const connect = require("./connection");
const app = require('./app');

connect().then(({db}) => {
  app.setupRoutes(db);
  console.log("The database is connected");
}).catch((e) => {
  console.error("Couldn't connect to database.", e);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
