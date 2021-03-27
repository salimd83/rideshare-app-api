require("dotenv").config();
const {MongoClient} = require('mongodb');
const express = require("express");
const cors = require("cors");

const port = process.env.PORT;
const dbURL = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let db;

async function runConnect() {
    try {
        await client.connect();
        db = client.db(dbName);
        const users = db.collection('users');
        users.createIndex({email: 1}, {unique: 1});

        console.log('The database is connected');
    } catch (error) {
        console.error("Couldn't connect to database.");
        console.log(error);
    }
}

runConnect();

const handleNewUser = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = db.collection('users');
            const results = await users.insertOne(user);
            resolve(results.insertedId);
        } catch (error) {
            reject(error);
        }
    })
}

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.post('/users', async (req, res) => {
    const user = req.body;
    try {
        const results = await handleNewUser(user);
        res.send(results)
    } catch (error) {
        if(error.message.startsWith('E11000 duplicate'))
            res.status(500).send('duplicate email.');
        else res.sendStatus(500);
    }

});

app.listen(port, () => console.log(`App listening on port ${port}!`));

