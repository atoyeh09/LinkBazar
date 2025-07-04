# LinkBzaar - SaaS Platform

LinkBzaar is a SaaS platform that provides a marketplace for users to buy, sell, and discover products and services.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **API**: RESTful API architecture

## Features

- User Authentication (Register, Login)
- Product Search
- Classified Ads Management
- Seller Dashboard with Metrics
- Admin Panel

## Project Structure

```
server/
├── config/         # Configuration files
├── controllers/    # Controller logic
├── middleware/     # Middleware functions
├── models/         # Mongoose models
├── routes/         # Express routes
├── services/       # Service functions
├── utils/          # Utility functions
├── seeds/          # Database seeding scripts
├── server.js       # Main server file
└── package.json    # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd server
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/linkbzaar
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Seed the database:
   ```
   npm run seed
   ```
5. Start the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

## API Documentation

Detailed API documentation is available in the `server/API_DOCUMENTATION.md` file.

## Default Users

After seeding the database, you can use the following credentials to log in:

- **Admin User**:
  - Email: admin@linkbzaar.com
  - Password: admin123

- **Seller User**:
  - Email: seller@linkbzaar.com
  - Password: seller123

- **Regular User**:
  - Email: user@linkbzaar.com
  - Password: user123
