const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const nodemailer = require('nodemailer');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./uploads'))
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single('image'), (req, res) => {
    try {
        // const filePath = req.file.path;
        const fileName = req.file.filename;
        res.status(200).json({ message: 'File uploaded successfully', url: fileName });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload file' });
    }
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
        const galleryCollection = client.db("PhotohouseBD").collection("gallery_collection");

        // app.get("/home_slider_images", async (req, res) => {
        //     const result = await homeSliderCollection.find({}).toArray();
        //     res.send(result);
        // });
        // app.get("/gallery", async (req, res) => {
        //     const result = await galleryCollection.find({}).toArray();
        //     res.send(result);
        // });
        // app.get("/redirect_links", async (req, res) => {
        //     const result = await collection.find({}).toArray();
        //     res.send(result[0]);
        // });
        // app.get("/magazines", async (req, res) => {
        //     const result = await MagazinesCollection.find({}).toArray();
        //     res.send(result);
        // });
        app.get("/all", async (req, res) => {
            const redirect_links = await collection.find({}).toArray();
            const Magazines = await MagazinesCollection.find({}).toArray();
            const gallery = await galleryCollection.find({}).toArray();
            res.send({ links: redirect_links[0], Magazines, gallery });
        });
        app.post('/gallery', (req, res) => {
            galleryCollection.insertOne(req.body).then(response => res.send({ isSuccess: true, message: 'Gallery image is successfully added!' }))
        })
        app.post('/magazine', (req, res) => {
            MagazinesCollection.insertOne(req.body).then(response => res.send({ isSuccess: true, message: 'Magazine is successfully uploaded!' }))
        })
        // app.post('/regn_memeber', (req, res) => {
        //     const file = req.files.file;
        //     const newImg = file.data;
        //     const encImg = newImg.toString('base64');
        //     var image = { contentType: file.mimetype, size: file.size, img: Buffer.from(encImg, 'base64') };
        //     MemberCollection.insertOne({ ...req.body, image }).then(response => res.send({ isSuccess: true, message: 'Member is successfully registered!' }))
        // })
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