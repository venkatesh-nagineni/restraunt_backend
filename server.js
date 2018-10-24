var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require('cors');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;

var shoppingList = require('./Routes/cartlist.js');

app.listen(8010, function (err) {
    if (err) {
        console.log(err);
        return new Error;
    } else {
        console.log("server listening on 8010");
    }
})

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });

var angebotestorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/angeboteImages')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var angeboteUpload = multer({ storage: angebotestorage });

const uri = "mongodb+srv://venkatesh:ivedamar.91@node-mongo-jyags.mongodb.net/test?retryWrites=true";

router.post('/postShoppingListdish', shoppingList.postShoppingListdish);
router.get('/getShoppingList', shoppingList.getShoppingList);
router.get('/getAngebote', shoppingList.getAngebote);
router.get('/getAngeboteHome', shoppingList.getAngeboteHome);
router.post('/removeDishItem', shoppingList.removeDishItem);

router.post('/postnewCategoryData', upload.single('image'), async (req, res) => {
    console.log(req.headers['name']);
    if (!req.file) {
        res.json({ success: false });
    } else {
        const categoryName = req.headers['name'];
        const categoryData = {
            dishType: categoryName,
            banner: req.file.filename,
            dishItems: []
        }
        const client = await MongoClient.connect(uri, { useNewUrlParser: true });
        const collection = client.db("shoppingCart").collection("shoppingList");
        const insertData = await collection.insert(categoryData);
        if (insertData) {
            res.status(200).json({ success: true, message: 'Inserted successfully' });
        }
    }
});

router.post('/postAngeboteData', angeboteUpload.single('image'), async (req, res) => {

    if (!req.file) {
        res.json({ success: false, message: 'image insertion failed' });
    } else {
        const angebotePrice =  Number(req.headers['price']);
        const extraInfo =  req.headers['data'];
        const angeboteId = req.headers['id'];
        const name = req.headers['name'];
        console.log(name);

        const client = await MongoClient.connect(uri, { useNewUrlParser: true });
        const collection = client.db("shoppingCart").collection("Angebote");
        const insertData = await collection.update({_id: new ObjectId(angeboteId)}, {$set: { AngeboteName: name, AngeboteImg: req.file.filename, AngebotePrice: angebotePrice, AngeboteDesc: extraInfo}}, {upsert: true});
        if (insertData) {
            res.status(200).json({ success: true, message: 'Inserted successfully' });
        }
    }
});