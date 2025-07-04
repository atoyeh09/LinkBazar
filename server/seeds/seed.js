const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Classified = require('../models/classified.model');
const users = require('./users.seed');
const products = require('./products.seed');
const classifieds = require('./classifieds.seed');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkbzaar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Classified.deleteMany();

    console.log('Data cleared');

    // Seed users
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);

    // Get user IDs for reference
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const sellerUsers = createdUsers.filter(user => user.role === 'seller');

    // Seed products with seller references
    const productsWithSellers = products.map((product, index) => {
      return {
        ...product,
        seller: sellerUsers[index % sellerUsers.length]._id
      };
    });

    const createdProducts = await Product.insertMany(productsWithSellers);
    console.log(`${createdProducts.length} products created`);

    // Seed classifieds with seller references
    const classifiedsWithSellers = classifieds.map((classified, index) => {
      return {
        ...classified,
        sellerId: sellerUsers[index % sellerUsers.length]._id
      };
    });

    const createdClassifieds = await Classified.insertMany(classifiedsWithSellers);
    console.log(`${createdClassifieds.length} classified ads created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
