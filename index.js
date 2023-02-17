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
        const MemberCollection = client.db("PhotohouseBD").collection("members");
        const MagazinesCollection = client.db("PhotohouseBD").collection("magazines");
        const galleryCollection = client.db("PhotohouseBD").collection("gallery");
        const homeSliderCollection = client.db("PhotohouseBD").collection("home_slider_images");

        app.get("/home_slider_images", async (req, res) => {
            const result = await homeSliderCollection.find({}).toArray();
            res.send(result);
        });
        app.get("/gallery", async (req, res) => {
            const result = await galleryCollection.find({}).toArray();
            res.send(result);
        });
        app.post('/gallery', (req, res) => {
            galleryCollection.insertOne(req.body).then(response => res.send({ isSuccess: true, message: 'gallery image is successfully added!' }))
        })
        app.get("/redirect_links", async (req, res) => {
            const result = await collection.find({}).toArray();
            res.send(result[0]);
        });
        app.get("/members", async (req, res) => {
            const result = await MemberCollection.find({}).toArray();
            res.send(result);
        });
        app.post('/regn_memeber', (req, res) => {
            const file = req.files.file;
            const newImg = file.data;
            const encImg = newImg.toString('base64');
            var image = { contentType: file.mimetype, size: file.size, img: Buffer.from(encImg, 'base64') };

            MemberCollection.insertOne({ ...req.body, image }).then(response => res.send({ isSuccess: true, message: 'Member is successfully registered!' }))
        })
        app.get("/magazines", async (req, res) => {
            const result = await MagazinesCollection.find({}).toArray();
            res.send(result);
        });
        app.post('/add_magazine', (req, res) => {
            const body = {
                name: 'Forbes',
                image: 'https://i.ibb.co/YDVp6fP/M2.png',
                redirect_link: "https://ibb.co/album/Bwcg28",
                category: 'Newest'
            }

            MagazinesCollection.insertOne(body).then(response => res.send({ isSuccess: true, message: 'magazine is successfully added!' }))
        })
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