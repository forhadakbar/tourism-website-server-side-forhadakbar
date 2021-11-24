const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middlewear
app.use(cors())
app.use(express.json())

// Test root
app.get('/', (req, res) => {
    res.send('Running WeTourTravel server side')
});


// Connect mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6reqm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect()
        const database = client.db('weTourTravel');
        const servicesCollection = database.collection('services');
        const bookingsCollection = database.collection('bookingItems');

        //GET API for ALL data

        app.get('/services', async (req, res) => {

            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);

        })


        //GET API for one service

        app.get('/services/:id', async (req, res) => {

            const id = req.params.id;
            console.log('getting id', id);

            const query = { _id: ObjectId(id) }

            const service = await servicesCollection.findOne(query);

            res.json(service);

        })

        //POST API TO ADD A NEW SERVICEs
        app.post('/services', (req, res) => {
            const newService = req.body;
            servicesCollection.insertOne(newService).then((result) => {
                res.send(result.insertedCount > 0);
            });
        });

        //POST API

        app.post('/bookingitems', (req, res) => {
            const newBooking = req.body;
            bookingsCollection.insertOne(newBooking).then((result) => {
                res.send(result.insertedCount > 0);
            });
        });

        // Show data for login user (Read)
        app.get('/myorders', (req, res) => {
            // console.log(req.query.email)
            bookingsCollection
                .find({ email: req.query.email })
                .toArray((err, documents) => {
                    res.send(documents);
                });
        });

        //Delete API

        app.delete('/deleteBooking/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: ObjectId(id) }

            const result = await bookingsCollection.deleteOne(query);

            res.json(result);

        });



        // Admin dashboard, show all users (Read)
        app.get('/adminTasks', (req, res) => {
            bookingsCollection.find({}).toArray((err, documents) => {
                res.send(documents);
            });
        });

        // Delete Task from Admin Dashboard
        app.delete('/deleteTask/:_id', (req, res) => {
            bookingsCollection
                .deleteOne({ _id: ObjectId(req.params._id) })
                .then((result) => {
                    res.send(result.deletedCount > 0);
                });
        });



    }

    finally {
        // await client.close()
    }

}

run().catch(console.dir);



app.listen(port, () => {
    console.log('Listening to port', port)
});