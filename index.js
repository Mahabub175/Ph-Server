const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectID } = require("mongodb");

const app = express();
app.use(cors({ origin: "*" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(express.static("./uploads"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "File uploaded successfully", url: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload file" });
  }
});
const port = 5000;
const uri =
  "mongodb+srv://Photohouse:X4rfPrPyy0wHWjkX@cluster0.h9calhb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const collection = client.db("PhotohouseBD").collection("redirect_links");
    const MagazinesCollection = client
      .db("PhotohouseBD")
      .collection("magazines");
    const galleryCollection = client
      .db("PhotohouseBD")
      .collection("gallery_collection");
    const interviewsCollection = client
      .db("PhotohouseBD")
      .collection("interviews");

    app.get("/all", async (req, res) => {
      const redirect_links = await collection.find({}).toArray();
      const Magazines = await MagazinesCollection.find({})
        .sort({ _id: -1 })
        .toArray();
      const gallery = await galleryCollection.find({}).toArray();
      const homeSliderImgs = await galleryCollection
        .find({ isHomeSlider: true })
        .toArray();
      const specialMagazineImgs = await MagazinesCollection.find({
        isSpecial: true,
      }).toArray();
      res.send({
        links: redirect_links[0],
        Magazines,
        gallery,
        homeSliderImgs,
        specialMagazineImgs,
      });
    });
    app.post("/gallery", (req, res) => {
      galleryCollection.insertOne(req.body).then((response) =>
        res.send({
          isSuccess: true,
          message: "Gallery image is successfully added!",
        })
      );
    });
    app.post("/magazines", (req, res) => {
      MagazinesCollection.insertOne(req.body).then((response) =>
        res.send({
          isSuccess: true,
          message: "Magazine is successfully uploaded!",
        })
      );
    });

    // POST interview
    app.post(
      "/interviews",
      upload.single("thumbnail_image"),
      async (req, res) => {
        try {
          const { title, content, short_descriptions } = req.body;
          const slug =
            title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
          const interview = {
            thumbnail_image: req.file.filename,
            title,
            content,
            short_descriptions,
            slug,
          };
          await interviewsCollection.insertOne(interview);
          res
            .status(200)
            .json({ message: "Interview added successfully", slug });
        } catch (error) {
          res.status(500).json({ message: "Failed to add interview" });
        }
      }
    );

    // GET all interviews
    app.get("/interviews", async (req, res) => {
      try {
        const interviews = await interviewsCollection.find({}).toArray();
        res.status(200).json(interviews);
      } catch (error) {
        res.status(500).json({ message: "Failed to get interviews" });
      }
    });

    // GET interview by slug
    app.get("/interviews/:slug", async (req, res) => {
      try {
        const { slug } = req.params;
        const interview = await interviewsCollection.findOne({ slug });
        if (interview) {
          res.status(200).json(interview);
        } else {
          res.status(404).json({ message: "Interview not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to get interview" });
      }
    });

    console.log("Connected successfully to server");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Congratulations! server is  running");
});

app.listen(process.env.PORT || port);
