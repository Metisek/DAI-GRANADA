import { MongoClient } from 'mongodb';

// Fetch credentials from the .env file
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

// Set up the MongoDB connection URL
const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// Function to connect to the database
async function connectToDb() {
  try {
    await client.connect();
    console.log(`Connected to database: ${dbName}`);
    return client.db(dbName);
  } catch (err) {
    console.error('Database connection error:', err.message);
    throw new Error('Database connection failed');
  }
}

// 1. Products over 100 $
async function getProductsOver100() {
  const db = await connectToDb();
  const products = await db.collection('products').find({ price: { $gt: 100 } }).toArray();
  console.log('Products over 100 $:', products);
}

// 2. Products containing 'winter' in the description, ordered by price
async function getWinterProducts() {
  const db = await connectToDb();
  const products = await db.collection('products')
    .find({ description: { $regex: /winter/i } })
    .sort({ price: 1 })
    .toArray();
  console.log('Winter products ordered by price:', products);
}

// 3. Jewelry products ordered by rating
async function getJewelryByRating() {
  const db = await connectToDb();
  const products = await db.collection('products')
    .find({ category: 'jewelery' })
    .sort({ 'rating.rate': -1 }) // sorting by rating score (descending)
    .toArray();
  console.log('Jewelry products ordered by rating:', products);
}

// 4. Total reviews (count in rating)
async function getTotalReviews() {
  const db = await connectToDb();
  const reviews = await db.collection('products').aggregate([
    { $group: { _id: null, totalReviews: { $sum: "$rating.count" } } }
  ]).toArray();
  console.log('Total reviews:', reviews[0].totalReviews);
}

// 5. Average score by product category
async function getAverageScoreByCategory() {
  const db = await connectToDb();
  const averageScores = await db.collection('products').aggregate([
    {
      $group: {
        _id: "$category",
        avgRating: { $avg: "$rating.rate" }
      }
    }
  ]).toArray();
  console.log('Average rating by category:', averageScores);
}

// 6. Users with digitless passwords
async function getDigitlessUsers() {
  const db = await connectToDb();
  const users = await db.collection('users')
    .find({ password: { $not: { $regex: /\d/ } } })
    .toArray();
  console.log('Users with digitless passwords:', users);
}

// Call functions based on your needs
await getProductsOver100();
await getWinterProducts();
await getJewelryByRating();
await getTotalReviews();
await getAverageScoreByCategory();
await getDigitlessUsers()
  .finally(() => client.close());
