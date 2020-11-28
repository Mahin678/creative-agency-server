const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.odwvb.mongodb.net/creativeAgency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
client.connect((err) => {
	const serviceCollection = client.db('creativeAgency').collection('products');
	const reviewCollection = client.db('creativeAgency').collection('review');
	const orderCollection = client.db('creativeAgency').collection('order');
	const adminCollection = client.db('creativeAgency').collection('admin');
	//admin
	//identify an admin
	app.get('/isAdmin', (req, res) => {
		const email = req.query.email;
		adminCollection.find({ admin: email }).toArray((err, document) => {
			res.send(document);
		});
	});
	app.get('/isUser', (req, res) => {
		const email = req.query.email;
		adminCollection.find({ admin: email }).toArray((err, document) => {
			res.send(document);
		});
	});
	//get all order data
	app.get('/showAllOrder', (req, res) => {
		orderCollection.find().toArray((err, document) => {
			res.send(document);
		});
	});
	//Make admin
	app.post('/makeAdmin', (req, res) => {
		const admin = req.body.email;
		adminCollection.insertOne({ admin }).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});
	//post data with image
	app.post('/addService', (req, res) => {
		const name = req.body.name;
		const email = req.body.email;
		const service = req.body.service;
		const description = req.body.description;
		const file = req.files.imageFile;
		const newImg = file.data;
		const encImg = newImg.toString('base64');
		const image = {
			contentType: req.files.imageFile.mimetype,
			size: req.files.imageFile.size,
			img: Buffer.from(encImg, 'base64'),
		};
		serviceCollection
			.insertOne({ name, email, image, service, description })
			.then((result) => {
				res.send(result.insertedCount > 0);
			});
	});
	//show all service
	app.get('/showService', (req, res) => {
		serviceCollection.find().toArray((err, document) => {
			res.send(document);
		});
	});
	//user panel
	// add order to user
	app.post('/addOrder', (req, res) => {
		const userName = req.body.userName;
		const userEmail = req.body.email;
		const status = req.body.status;
		const description = req.body.description;
		const service = req.body.service;
		const price = req.body.price;
		const serviceName = req.body.serviceName;
		const date = req.body.date;
		const file = req.files.image;
		const Img = file.data;
		console.log(status);
		const encImg = Img.toString('base64');

		const image = {
			contentType: req.files.image.mimetype,
			size: req.files.image.size,
			img: Buffer.from(encImg, 'base64'),
		};

		orderCollection
			.insertOne({
				userName,
				userEmail,
				description,
				serviceName,
				image,
				service,
				price,
				date,
				status,
			})
			.then((result) => {
				res.send(result.insertedCount > 0);
			});
	});
	//show order for user
	app.get('/showAllUserOrder', (req, res) => {
		orderCollection
			.find({ userEmail: req.query.email })
			.toArray((err, document) => {
				res.status(200).send(document);
			});
	});
	//add review service
	app.post('/addReview', (req, res) => {
		const newReview = req.body;
		reviewCollection.insertOne(newReview).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});
	//update Service
	app.patch('/UpdateService/:id', (req, res) => {
		orderCollection
			.updateOne(
				{ _id: ObjectID(req.params.id) },
				{
					$set: {
						status: req.body.status,
					},
				}
			)
			.then((result, err) => console.log(result));
	});
	// get all reviews
	app.get('/getAllReviews', (req, res) => {
		reviewCollection.find().toArray((err, document) => {
			res.status(202).send(document);
		});
	});
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(port);
