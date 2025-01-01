const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzkk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const marathonCollection = client.db('marathonDB').collection('marathon');
        const marathonRegisterCollection = client.db('marathonDB').collection('marathonRegister');

        // Marathon data Post
        app.post('/marathons', async (req, res) => {
            const newMarathon = req.body;
            const result = await marathonCollection.insertOne(newMarathon);
            res.send(result);
        })
        // Marathon Register Post
        app.post('/marathons-register', async (req, res) => {
            const newMarathonRegister = req.body;
            const result = await marathonRegisterCollection.insertOne(newMarathonRegister);
        
            const id = newMarathonRegister.register_id;
        
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $inc: { apply_count: 1 },
            };
            const updateResult = await marathonCollection.updateOne(filter, updateDoc);
        
            res.send({ result, updateResult });
        });
        


        // Marathon Data Get
        app.get('/marathons', async (req, res) => {
            const cursor = marathonCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
        // Marathon Update
        app.put('/marathons/:id', async(req, res)=>{
            const id = req.params.id;
            const mrathon = req.body;
            const filter= {_id: new ObjectId(id)};
            const options= {upsert: true};
            const updatedMarathon ={
                $set:{
                   title: mrathon.title,
                    location: mrathon.location,
                    runningDitance: mrathon.runningDistance,
                    photoURL: mrathon.photoURL,
                }
            }
            const result = await marathonCollection.updateOne(filter, updatedMarathon, options)  
            res.send(result);
        })

        // Marathon delete
        app.delete('/marathons/:id',async(req, res)=>{
            const id =req.params.id;
            const query={_id: new ObjectId(id)}
            const result= await marathonCollection.deleteOne(query);
            res.send(result);
        })


        // see more ditails of marathon
        app.get('/marathon/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await marathonCollection.findOne(query);
            res.send(result);
        })

        // my marathon list
        app.get('/marathons/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await marathonCollection.find(query).toArray();
            res.send(result);
        })
        // my marathon register list
        app.get('/marathons-register/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await marathonRegisterCollection.find(query).toArray();
            res.send(result);
        })


        // Update my marathon register
        app.put('/marathons-register/:id', async(req, res)=>{
            const id = req.params.id;
            const marathonRegister = req.body;
            const filter= {_id: new ObjectId(id)};
            const options= {upsert: true};
            const updatedmarathonRegister ={
                $set:{
                   contactNumber: marathonRegister.contactNumber,
                    firstName: marathonRegister.firstName,
                    lastName: marathonRegister.lastName,
                    age: marathonRegister.age,
                }
            }
            const result = await marathonRegisterCollection.updateOne(filter, updatedmarathonRegister, options); 
            res.send(result);
        })

        // my regitration delete
        app.delete('/marathons-register/:id',async(req, res)=>{
            const id =req.params.id;
            const query={_id: new ObjectId(id)}
            const result= await marathonRegisterCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Marathon server is Running')
})

app.listen(port, () => {
    console.log(`Marathon server is running on port : ${port}`)
})