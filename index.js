const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const nodemailer = require('nodemailer');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

const port = 5000;
const uri = "mongodb+srv://Photohouse:X4rfPrPyy0wHWjkX@cluster0.h9calhb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection = client.db("PhotohouseBD").collection("redirect_links");

        app.get("/redirect_links", async (req, res) => {
            const result = await collection.find({}).toArray();
            res.send(result[0]);
        });
        console.log("Connected successfully to server");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Congratulations! server is  running');
})

app.listen(process.env.PORT || port)
// module.exports = app;
