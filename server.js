var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require('cors');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var https = require('https');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var http = require('http');
var enforce = require('express-sslify');
const MongoClient = require("mongodb").MongoClient;
var mongoose = require('mongoose');
var shoppingList = require('./Routes/cartlist.js');
var shopSchema = require('./models/shoppingModel');
var angeboteSchema = require('./models/angeboteModel');

var port = 80;

// const uri = "mongodb+srv://venkatesh:ivedamar.91@node-mongo-jyags.mongodb.net/test?retryWrites=true";

const uri = "mongodb://shopping:shopping123@82.165.65.207:27017/shoppingCart";

// Serve only the static files form the dist directory

app.use(express.static('./dist/restraunt'));
app.use(enforce.HTTPS());

app.all('*', function(req, res) {
    res.redirect("https://mishnmash.de");
  });

const options = {
    cert: fs.readFileSync('./certs/fullchain.pem'),
    key: fs.readFileSync('./certs/privkey.pem')
};

app.listen(port, function(err, data) {
    if(!err) {
        console.log('server listening on port ' + port);
    }
});
https.createServer(options, app).listen(443);

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

router.post('/postShoppingListdish', shoppingList.postShoppingListdish);
router.get('/getShoppingList', shoppingList.getShoppingList);
router.get('/getAngebote', shoppingList.getAngebote);
router.get('/getAngeboteHome', shoppingList.getAngeboteHome);
router.post('/removeDishItem', shoppingList.removeDishItem);
router.post('/sendmail', shoppingList.sendmail);
router.post('/registrationData', shoppingList.registrationData);
router.post('/loginUser', shoppingList.loginUser);
router.get('/getShoppingListOnly', shoppingList.getShoppingListOnly);
router.post('/blockUser', shoppingList.blockUser);
router.get('/checkTrustedUser', shoppingList.checkTrustedUser);
router.post('/forgotPwd', shoppingList.forgotPwd);
router.post('/contactMail', shoppingList.contactMail);
router.get('/getBlockedList', shoppingList.getBlockedList);
router.post('/unBlockUser', shoppingList.unBlockUser);

router.post('/postnewCategoryData', upload.single('image'), async (req, res) => {
  if (!req.file) {
      res.json({ success: false });
  } else {
      const categoryName = req.headers['name'];
      const categoryData = {
          dishType: categoryName,
          banner: req.file.filename,
          dishItems: []
      }
      /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
      const collection = client.db("shoppingCart").collection("shoppingList");
      const insertData = await collection.insert(categoryData); */
      var connect = await mongoose.connect(uri, {useNewUrlParser: true});
      var newData = new shopSchema(categoryData);
      const insertData = newData.save();
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

      /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
      const collection = client.db("shoppingCart").collection("Angebote"); */
      var connect = await mongoose.connect(uri, {useNewUrlParser: true});
      const insertData = await angeboteSchema.updateOne({_id: new ObjectId(angeboteId)}, {$set: { AngeboteName: name, AngeboteImg: req.file.filename, AngebotePrice: angebotePrice, AngeboteDesc: extraInfo}}, {upsert: true});
      if (insertData) {
          res.status(200).json({ success: true, message: 'Inserted successfully' });
      }
  }
});