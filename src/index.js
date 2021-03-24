require("dotenv").config();
const express = require("express");
const cors = require("cors");

const port = process.env.PORT;
const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.listen(port, () => console.log(`App listening on port ${port}!`));

