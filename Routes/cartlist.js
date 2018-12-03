const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const nodemailer = require('nodemailer');
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var fs = require('fs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var angeboteSchema = require('../models/angeboteModel');
var shopSchema = require('../models/shoppingModel');
var userSchema = require('../models/userModel');
var pm2 = require('pm2');

// const uri = "mongodb+srv://venkatesh:ivedamar.91@node-mongo-jyags.mongodb.net/test?retryWrites=true";
const uri = "mongodb://shopping:shopping123@82.165.65.207:27017/shoppingCart";

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: 'smtp.1und1.de',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'pizzaria-express@mishnmash.de', // generated ethereal user
        pass: 'Ashwatthama#3' // generated ethereal password
    }
});

module.exports = {
    registrationData: async (req, res) => {
        try {
            const data = req.body.userdata;
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("userDetails");
            const insertData = await collection.insert(data); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            var newUser = new userSchema(data);
            const insertData = await newUser.save();
            if (insertData) {
                res.status(200).json({ success: true, message: 'Inserted successfully' });
            }
        } catch (error) {
            res.status(400).json({ success: false, message: 'something went wrong. Insrtion failed!', error: error });
        }
    },

    loginUser: async (req, res) => {
        try {
            const data = req.body.loginData;
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("userDetails");
            const result = await collection.find({ $and: [{ email: data.email }, { password: data.password }] }).toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const result = await userSchema.find({ $and: [{ email: data.email }, { password: data.password }] });
            const token = jwt.sign({ pizza: 'pizzaria-express' }, 'pizzaria-express@/www', { expiresIn: '73h' });
            if (result.length != 0) {
                const tokenUpdate = await userSchema.updateOne({ email: data.email, password: data.password }, { $set: { token: token } });
                if (tokenUpdate) {
                    res.json({ success: true, message: "login successful", token: token, result: result })
                }
            } else {
                res.json({ success: false, message: "login error" })
            }
        } catch (error) {
            res.status(400).json({ success: false, message: 'something went wrong. Please check your credentials', error: error });
        }
    },

    postShoppingListdish: async (req, res) => {
        try {
            const _id = req.body.id;
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("shoppingList");
            const insertData = await collection.update({ _id: new ObjectId(_id) }, { $push: { dishItems: req.body.data } }); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await shopSchema.updateOne({ _id: new ObjectId(_id) }, { $push: { dishItems: req.body.data } });
            if (insertData) {
                res.status(200).json({ success: true, message: 'Inserted successfully' });
            }
        } catch (error) {
            res.status(400).json({ success: false, message: 'something went wrong. Insrtion failed!', error: error });
        }
    },

    postnewcategorydata: async (req, res) => {
        try {
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("shoppingList"); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            var newCatgory = new shopSchema(req.body.data);
            const insertData = await newCatgory.save();
            if (insertData) {
                res.status(200).json({ success: true, message: 'Inserted successfully' });
            }
        } catch (error) {
            res.status(400).json({ success: false, message: 'something went wrong. Insrtion failed!', error: error })
        }
    },
    getShoppingList: async (req, res) => {
        try {
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("shoppingList");
            const insertData = await collection.find().toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await shopSchema.find({});
            var imgData = [];
            fs.readdirSync('./images/uploads').forEach(file => {
                var base64String = './images/uploads/' + file + '';
                var body = fs.readFileSync(base64String);
                imgData.push({ data: body.toString('base64'), fileName: file });
            })
            res.status(200).json({ success: true, data: insertData, imgData: imgData });
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error });
            process.exit(0);
            pm2.restart('server');

        }
    },

    getShoppingListOnly: async (req, res) => {
        try {
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("shoppingList");
            const insertData = await collection.find().toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await shopSchema.find({});
            res.status(200).json({ success: true, data: insertData });
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error })
        }
    },

    blockUser: async (req, res) => {
        try {
            const data = req.body.data;
           /*  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("userDetails");
            const updateData = await collection.find({ $or: [{ email: data.email }, { phone: data.phone }] }).toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const updateData = await userSchema.find({$or: [{email: data.email},{phone: data.phone}]}); 
            if (updateData.length != 0) {
                const statusUpdate = await userSchema.updateOne({ _id: new ObjectId(updateData[0]._id) }, { $set: { trusted: false } });
                if (statusUpdate) {
                    res.status(200).json({ success: true, data: statusUpdate, message: "User Blocked successfully" });
                }
            } else {
                res.status(200).json({ success: false, message: "User not found!" });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, message: 'something went wrong. User not found!', error: error })
        }
    },

    checkTrustedUser: async (req, res) => {
        try {
            const data = req.headers['token'];
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("userDetails");
            const insertData = await collection.find({ token: data }).toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await userSchema.find({ token: data });
            if (insertData.length != 0) {
                res.status(200).json({ success: true, userdata: insertData });
            } else {
                res.status(200).json({ success: false, message: 'user blocked' });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error })
        }
    },

    getAngebote: async (req, res) => {
        try {
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("Angebote");
            const insertData = await collection.find().toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await angeboteSchema.find({});
            if (insertData) {
                res.status(200).json({ success: true, data: insertData });
            }
        } catch (error) {
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error })
        }
    },

    getAngeboteHome: async (req, res) => {
        try {
           /*  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("Angebote");
            const insertData = await collection.find().toArray(); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const insertData = await angeboteSchema.find({});
            var imgData = [];
            fs.readdirSync('./images/angeboteImages').forEach(file => {
                var base64String = './images/angeboteImages/' + file + '';
                var body = fs.readFileSync(base64String);
                imgData.push({ data: body.toString('base64'), fileName: file });
            })
            res.status(200).json({ success: true, data: insertData, imgData: imgData });
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error });
            process.exit(0);
            pm2.restart('server');
        }
    },

    removeDishItem: async (req, res) => {
        try {
            const data = req.body.data;
            /* const client = await MongoClient.connect(uri, { useNewUrlParser: true });
            const collection = client.db("shoppingCart").collection("shoppingList");
            const status = collection.update({ _id: new ObjectId(data.catId) }, { $pull: { dishItems: { itemNo: data.itemId } } }); */
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const status = await shopSchema.updateOne({ _id: new ObjectId(data.catId) }, { $pull: { dishItems: { itemNo: data.itemId } } });
            res.status(200).json({ success: true, message: 'Item Removed successfully' })

        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error })
        }
    },

    getBlockedList: async (req, res) => {
        try {
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const status = await userSchema.find({trusted: false}, 'fullname email phone trusted');
            res.status(200).json({ success: true, data: status })

        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error });
        }
    },

    unBlockUser: async (req, res) => {
        try {
            const id = req.body.id;
            await userSchema.updateOne({ _id: new ObjectId(id) }, { $set: { trusted: true } });
            res.status(200).json({ success: true, message: 'User blocked successfully' });
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error });
        }
    },

    contactMail: async (req, res) => {
        try {
            const data = req.body.data;
            const phone = data.phone || '';

            if(data) {
                let forgotOptions = {
                    from: '"Pizzaria-Express Roadgau" <pizzaria-express@mishnmash.de>', // sender address
                    to: 'venky.chowdary91@gmail.com', // list of receivers
                    subject: 'Message from customer', // Subject line
                    text: '',
                    html: '<b>Deine Message ist: <b>'+'<br>' + 'Name: ' + data.name + '<br>' + 'Email: ' + data.email + '<br>' + 'Phone: ' + phone + '<br>' + 'Message: ' + data.message
                };
                // send mail with defined transport object
                const sendMail = await transporter.sendMail(forgotOptions);
                if (sendMail.accepted.length != 0) {
                    res.status(200).json({ success: true, message: 'Thank you for your Email. We will get back to you as soon as possible' });
                }
            } else {
                res.json({success: false, message: 'Please try after some time'});
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'Server Error!', error: error })
        }
    },

    forgotPwd: async (req, res) => {
        try {
            const email = req.body.email;
            var connect = await mongoose.connect(uri, {useNewUrlParser: true});
            const data = await userSchema.find({ email: email });
            if(data.length !== 0) {
                let forgotOptions = {
                    from: '"Pizzaria-Express Roadgau" <pizzaria-express@mishnmash.de>', // sender address
                    to: data[0].email, // list of receivers
                    subject: 'Ihre deine passwort "Pizzeria Express Roadgau"', // Subject line
                    text: '',
                    html: '<b>Deine passwort ist: <b>' + data[0].password
                };
                // send mail with defined transport object
                const sendMail = await transporter.sendMail(forgotOptions);
                if (sendMail.accepted.length != 0) {
                    res.status(200).json({ success: true, message: 'Please check youe Email to proceed (inbox or spam)' });
                }
            } else {
                res.json({success: false, message: 'user not found'});
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ success: false, message: 'something went wrong. Insertion failed!', error: error })
        }
    },

    sendmail: async (req, res) => {
        nodemailer.createTestAccount((err, account) => {

            const mailData = req.body.cartdata;
            const userdata = req.body.userdata;
            var content = mailData.reduce(function (a, b) {
                return a + '<tr><td>' + b.quantity + 'x \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + b.itemName + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + '€\xa0' + b.itemtotalamount + '</td></tr>';
            }, '');

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Pizzaria-Express Roadgau" <pizzaria-express@mishnmash.de>', // sender address
                to: userdata.perosnalinfo.email, // list of receivers
                subject: 'Ihre Bestellung bei "Pizzeria Express Roadgau"', // Subject line
                text: '',
                html: '<b>Ihre Bestellung ist eingegangen und wird nun an "Pizzeria Express Roadgau" weitergeleitet</b>.<br><br> \
                <p style="word-wrap: break-word;width: 550px;text-align: justify;">Bei Fragen oder Anmerkungen zu Ihrer getätigten Bestellung möchten wir Sie bitten das Restaurant unter 06106 4075 anzurufen. \
                Achtung: Sie können nicht per E-Mail antworten! Es besteht die Möglichkeit, dass "Pizzeria Express Roadgau" Sie anrufen wird.  \
                Bitte bleiben Sie unter der von Ihnen angegebenen Telefonnummer erreichbar und behalten Sie Ihren E-Maileingang im Auge. \
                Die Lieferzeit bei diesem Restaurant beträgt durchschnittlich 45 Minuten. An Sonn- und Feiertagen kann es etwas länger dauern. \
                "Pizzeria Express Roadgau" wird Sie aber in diesem Fall über eine Verzögerung der Lieferung informieren.</p> \
                Lieferando.de hat keinen Einfluss auf den Lieferzeitpunkt Ihrer Bestellung.<br><br> <b>\
                Pizzaria Express Roadgau  wünscht Ihnen einen guten Appetit!</b><br><br> ' + '<b style="color: orange">Ihre Bestellung</b><br><br>' + content +
                    '<tr><td>' + '' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + 'Gesamptpries' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + '€\xa0' + userdata.totalamount + '</td></tr>' +
                    '<b style="color: orange"> Ihre addresse </b><br><br>' + userdata.perosnalinfo.name + '<br>' + userdata.address.adresse + '<br>' +
                    userdata.address.zip + ',' + userdata.address.stadt + '<br>' + userdata.perosnalinfo.phNo
            };

            var admincontent = mailData.reduce(function (a, b) {
                return a + '<tr><td>' + b.quantity + 'x \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + b.itemName + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + '€\xa0' + b.itemtotalamount + '</td></tr>'
                    + '<tr><td></td>' + '<td>\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + b.extras + '<td></tr>';
            }, '');

            let adminOptions = {
                from: '"Pizzaria-Express Roadgau " <pizzaria-express@mishnmash.de>', // sender address
                to: 'roshan544@gmail.com', // list of receivers
                subject: 'Ihre Bestellung bei "Pizzeria Express Roadgau"', // Subject line
                text: '', // plain text body
                html: '<b>Ihre Bestellung ist eingegangen und wird nun an "Pizzeria Express Roadgau" weitergeleitet</b>.<br><br> \ ' + '<b style="color: orange">Ihre Bestellung</b><br><br>' + admincontent +
                    '<tr><td>' + '' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + 'Gesamptpries' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + '</td><td>' + '€\xa0' + userdata.totalamount + '</td></tr>' + '<br><br>' +
                    '<b style="color: orange"> Ihre addresse </b><br><br>' + userdata.perosnalinfo.name + '<br>' + userdata.address.adresse + '<br>' +
                    userdata.address.zip + ',' + userdata.address.stadt + '<br>' + userdata.perosnalinfo.phNo + '<br><br>' + '<b style="color: orange">Ihre extra info</b>' + '<br><br>' +
                    'Payment Method: \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + userdata.paymentmethod + '<br>' +
                    'Payment Change: \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + userdata.paymentChange + '<br>' +
                    'Delivery time: \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + userdata.deliveryTime + '<br>' +
                    'Extra info: \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + userdata.extraInfo + '<br>' +
                    'Distance: \xa0\xa0\xa0\xa0\xa0\xa0\xa0' + userdata.distance
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                transporter.sendMail(adminOptions, (error, info) => {
                    if (error) {
                        res.json({ sucess: false, message: 'Order processing error! please try again later' });
                        console.log(error);
                    } else {
                        res.json({ sucess: true, message: 'Order placed successfully' });
                    }
                });
            });
        })
    }

};
