import { MongoClient } from 'mongodb';
// Use node-fetch for Node.js if needed (for older versions)
// import fetch from 'node-fetch';

console.log('🏁 seed.js ----------------->');

// Fetch credentials from the .env file
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

// Set up the MongoDB connection URL
const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// Asynchronous function to insert data into a collection
async function insertDataIntoCollection(collectionName, apiUrl) {
  try {
    const data = await fetch(apiUrl).then(res => res.json());

    // Connect to the database
    await client.connect();
    console.log(`Connected to database: ${dbName}`);

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert data into the specified collection
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents were inserted into ${collectionName}`);

    return `${data.length} records fetched for collection: ${collectionName}`;
  } catch (err) {
    console.error(`Error in fetching or inserting data for ${collectionName}:`, err.message);
    throw new Error(`Error during fetch or insert for collection ${collectionName}`);
  } finally {
    await client.close();
    console.log(`Disconnected from database: ${dbName}`);
  }
}

// Sequential insertion process
insertDataIntoCollection('products', 'https://fakestoreapi.com/products')
  .then((r) => console.log(`Success: ${r}`))
  .then(() => insertDataIntoCollection('users', 'https://fakestoreapi.com/users'))
  .then((r) => console.log(`Success: ${r}`))
  .catch((err) => console.error('Something went wrong: ', err.message));

console.log('This happens first');
