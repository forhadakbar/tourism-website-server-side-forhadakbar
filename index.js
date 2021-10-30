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
    res.send('Hello from WeTourTravel')
});


// Connect mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6reqm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect()
        const database = client.db('weTourTravel');
        const servicesCollection = database.collection('services');

        //GET API for ALL data

        app.get('/services', async (req, res) => {

            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);

        })


        //GET API for one service

        app.get('/services/:id', async (req, res) => {

            const id = req.params.id;
            console.log('gettin id', id);

            const query = { _id: ObjectId(id) }

            const service = await servicesCollection.findOne(query);

            res.json(service);

        })

        //POST API

        app.post('/services', async (req, res) => {

            const service = req.body;

            console.log("hit post", service)

            const result = await servicesCollection.insertOne(service);
            // console.log(result)

            res.json(result)



        })

        //Delete API

        app.delete('/services/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: ObjectId(id) }

            const result = await servicesCollection.deleteOne(query);

            res.json(result);

        })

    }

    finally {
        // await client.close()
    }

}

run().catch(console.dir);



app.listen(port, () => {
    console.log('Listening to port', port)
});