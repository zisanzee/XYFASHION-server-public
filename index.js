const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

console.log(process.env.DB_USER);
app.use(express.json())
app.use(cors())

app.get('/', async (req, res) => {
  res.send(`server running on port: ${port}`)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j1gum5d.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
   
    await client.connect();

    const database = client.db('brandBD')
    const brands = database.collection('brands');

    const productsCollection = database.collection('productsCollection')
    const cartCollection = database.collection('cartCollection')

    app.get('/brands', async (req, res) => {
      const cursor = brands.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/products', async (req, res) => {
      const product = req.body
      const result = await productsCollection.insertOne(product)
      res.send(result)
    })

    app.get('/products/:brand', async (req, res) => {
      const brand = req.params.brand
      const query = { brand: brand }
      const cursor = await productsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/products/details/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

    app.put('/products/details/:id', async (req, res) => {
      const id = req.params.id
      const product = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          image : product.image,
          name : product.name,
          brand : product.brand,
          type : product.type,
          price : product.price,
          rating : product.rating,
          description : product.description,
        }
      }

      const result = await productsCollection.updateOne(query, updatedProduct, options)
      res.send(result)

    })


    app.post('/cart', async (req, res) => {
      const product = req.body
      const result = await cartCollection.insertOne(product)
      res.send(result)
    })
    app.get('/cart', async (req, res) => {
      const cursor = cartCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: id}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}

run().catch(console.dir);
app.listen(port, () => {
  console.log(`server running on port: ${port}`);
})