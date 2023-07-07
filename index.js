const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(express.static('./uploads'))
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });
app.post('/upload', upload.single('image'), (req, res) => {
    try {
        res.status(200).json({ message: 'File uploaded successfully', url: req.file.filename });
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
            const homeSliderImgs = await galleryCollection.find({ isHomeSlider: true }).toArray();
            res.send({ links: redirect_links[0], Magazines, gallery, homeSliderImgs });
        });
        app.post('/gallery', (req, res) => {
            galleryCollection.insertOne(req.body).then(response => res.send({ isSuccess: true, message: 'Gallery image is successfully added!' }))
        })
        app.post('/magazines', (req, res) => {
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
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Congratulations! server is  running');
})

app.listen(process.env.PORT || port)