# LinkBzaar API Documentation

This document provides detailed information about the RESTful APIs available in the LinkBzaar platform.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. To authenticate, include a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

You can obtain a token by logging in or registering.

---

## User Authentication APIs

### 1. Register User

**API Name:** Register User
**Endpoint:** `/users/register`
**HTTP Method:** POST
**Request Body Format:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "User already exists"
}
```

**Sample Postman Request:**

```
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User

**API Name:** Login User
**Endpoint:** `/users/login`
**HTTP Method:** POST
**Request Body Format:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Failure Response Example (Invalid Credentials):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Failure Response Example (Email Not Verified):**

```json
{
  "success": false,
  "message": "Email not verified. A new verification code has been sent to your email.",
  "requiresVerification": true,
  "userId": "60d21b4667d0d8992e610c85"
}
```

**Sample Postman Request:**

```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Verify Email with OTP

**API Name:** Verify Email with OTP
**Endpoint:** `/users/verify-email`
**HTTP Method:** POST
**Request Body Format:**

```json
{
  "userId": "60d21b4667d0d8992e610c85",
  "otp": "123456"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

**Sample Postman Request:**

```
POST /api/users/verify-email
Content-Type: application/json

{
  "userId": "60d21b4667d0d8992e610c85",
  "otp": "123456"
}
```

### 4. Resend Verification Email

**API Name:** Resend Verification Email
**Endpoint:** `/users/resend-verification`
**HTTP Method:** POST
**Request Body Format:**

```json
{
  "email": "john@example.com"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "userId": "60d21b4667d0d8992e610c85"
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Email is already verified"
}
```

**Sample Postman Request:**

```
POST /api/users/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

## Product Search APIs

### 1. Search Products

**API Name:** Search Products
**Endpoint:** `/products/search?query=term`
**HTTP Method:** GET
**Request Parameters:**
- `query` (string, required): Search term for product name, description, brand, URL, or keywords

**Success Response Example:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Samsung Galaxy S21",
      "description": "Brand new Samsung Galaxy S21 with 128GB storage...",
      "price": 150000,
      "category": "Electronics",
      "brand": "Samsung",
      "condition": "New",
      "images": ["https://example.com/images/samsung-s21-1.jpg", "https://example.com/images/samsung-s21-2.jpg"],
      "url": "https://www.samsung.com/pk/smartphones/galaxy-s21/",
      "keywords": ["smartphone", "android", "samsung", "galaxy", "mobile phone"],
      "isActive": true,
      "seller": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Seller User",
        "email": "seller@example.com"
      },
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c87",
      "name": "Samsung 55\" 4K Smart TV",
      "description": "Samsung 55-inch 4K Ultra HD Smart LED TV...",
      "price": 85000,
      "category": "Electronics",
      "brand": "Samsung",
      "condition": "Good",
      "images": ["https://example.com/images/samsung-tv-1.jpg", "https://example.com/images/samsung-tv-2.jpg"],
      "url": null,
      "keywords": ["tv", "television", "samsung", "smart tv", "4k"],
      "isActive": true,
      "seller": {
        "_id": "60d21b4667d0d8992e610c88",
        "name": "Ali Khan",
        "email": "ali@example.com"
      },
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    }
  ]
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Search query is required"
}
```

**Sample Postman Request:**

```
GET /api/products/search?query=samsung
```

---

## Classified Ads APIs

### 1. Create Classified Ad

**API Name:** Create Classified Ad
**Endpoint:** `/classifieds`
**HTTP Method:** POST
**Authentication:** Required
**Request Body Format:**

```json
{
  "title": "iPhone 13 Pro Max - 256GB - Barely Used",
  "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color...",
  "price": 230000,
  "category": "Electronics",
  "region": "Lahore",
  "location": {
    "type": "Point",
    "coordinates": [74.3587, 31.5204]  // [longitude, latitude]
  },
  "images": [
    "https://example.com/images/iphone-13-1.jpg",
    "https://example.com/images/iphone-13-2.jpg"
  ],
  "condition": "Like New",
  "contactPhone": "+92 321 1234567",
  "contactEmail": "seller@example.com"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c89",
    "title": "iPhone 13 Pro Max - 256GB - Barely Used",
    "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color...",
    "price": 230000,
    "category": "Electronics",
    "region": "Lahore",
    "images": [
      "https://example.com/images/iphone-13-1.jpg",
      "https://example.com/images/iphone-13-2.jpg"
    ],
    "condition": "Like New",
    "contactPhone": "+92 321 1234567",
    "contactEmail": "seller@example.com",
    "isActive": true,
    "isPromoted": false,
    "views": 0,
    "sellerId": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-06-19T12:00:00.000Z",
    "updatedAt": "2023-06-19T12:00:00.000Z"
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Title is required"
}
```

**Sample Postman Request:**

```
POST /api/classifieds
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "iPhone 13 Pro Max - 256GB - Barely Used",
  "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color...",
  "price": 230000,
  "category": "Electronics",
  "region": "Lahore",
  "images": [
    "https://example.com/images/iphone-13-1.jpg",
    "https://example.com/images/iphone-13-2.jpg"
  ],
  "condition": "Like New",
  "contactPhone": "+92 321 1234567",
  "contactEmail": "seller@example.com"
}
```

### 2. Get All Classified Ads

**API Name:** Get All Classified Ads
**Endpoint:** `/classifieds`
**HTTP Method:** GET
**Request Parameters (optional):**
- `category` (string): Filter by category
- `region` (string): Filter by region
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `condition` (string): Filter by condition
- `sort` (string): Sort field(s), comma-separated
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

**Success Response Example:**

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c89",
      "title": "iPhone 13 Pro Max - 256GB - Barely Used",
      "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color...",
      "price": 230000,
      "category": "Electronics",
      "region": "Lahore",
      "images": [
        "https://example.com/images/iphone-13-1.jpg",
        "https://example.com/images/iphone-13-2.jpg"
      ],
      "condition": "Like New",
      "contactPhone": "+92 321 1234567",
      "contactEmail": "seller@example.com",
      "isActive": true,
      "isPromoted": true,
      "views": 145,
      "sellerId": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Seller User",
        "email": "seller@example.com"
      },
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c90",
      "title": "Samsung 55\" 4K Smart TV - 1 Year Old",
      "description": "Samsung 55-inch 4K Ultra HD Smart LED TV, 1 year old...",
      "price": 85000,
      "category": "Electronics",
      "region": "Islamabad",
      "images": [
        "https://example.com/images/samsung-tv-1.jpg",
        "https://example.com/images/samsung-tv-2.jpg"
      ],
      "condition": "Good",
      "contactPhone": "+92 345 1122334",
      "contactEmail": "electronics@example.com",
      "isActive": true,
      "isPromoted": false,
      "views": 110,
      "sellerId": {
        "_id": "60d21b4667d0d8992e610c88",
        "name": "Ali Khan",
        "email": "ali@example.com"
      },
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    }
  ]
}
```

**Sample Postman Request:**

```
GET /api/classifieds?category=Electronics&region=Lahore&minPrice=50000&maxPrice=250000&page=1&limit=10
```

### 3. Get Single Classified Ad

**API Name:** Get Single Classified Ad
**Endpoint:** `/classifieds/:id`
**HTTP Method:** GET
**Request Parameters:**
- `id` (string, required): Classified ad ID

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c89",
    "title": "iPhone 13 Pro Max - 256GB - Barely Used",
    "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color...",
    "price": 230000,
    "category": "Electronics",
    "region": "Lahore",
    "images": [
      "https://example.com/images/iphone-13-1.jpg",
      "https://example.com/images/iphone-13-2.jpg"
    ],
    "condition": "Like New",
    "contactPhone": "+92 321 1234567",
    "contactEmail": "seller@example.com",
    "isActive": true,
    "isPromoted": true,
    "views": 146,
    "sellerId": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Seller User",
      "email": "seller@example.com"
    },
    "createdAt": "2023-06-19T12:00:00.000Z",
    "updatedAt": "2023-06-19T12:00:00.000Z"
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Classified ad not found"
}
```

**Sample Postman Request:**

```
GET /api/classifieds/60d21b4667d0d8992e610c89
```

### 4. Update Classified Ad

**API Name:** Update Classified Ad
**Endpoint:** `/classifieds/:id`
**HTTP Method:** PUT
**Authentication:** Required
**Request Parameters:**
- `id` (string, required): Classified ad ID
**Request Body Format:**

```json
{
  "title": "iPhone 13 Pro Max - 256GB - Price Reduced",
  "price": 210000,
  "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color. Price reduced for quick sale!"
}
```

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c89",
    "title": "iPhone 13 Pro Max - 256GB - Price Reduced",
    "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color. Price reduced for quick sale!",
    "price": 210000,
    "category": "Electronics",
    "region": "Lahore",
    "images": [
      "https://example.com/images/iphone-13-1.jpg",
      "https://example.com/images/iphone-13-2.jpg"
    ],
    "condition": "Like New",
    "contactPhone": "+92 321 1234567",
    "contactEmail": "seller@example.com",
    "isActive": true,
    "isPromoted": true,
    "views": 146,
    "sellerId": "60d21b4667d0d8992e610c85",
    "createdAt": "2023-06-19T12:00:00.000Z",
    "updatedAt": "2023-06-19T12:30:00.000Z"
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Not authorized to update this classified ad"
}
```

**Sample Postman Request:**

```
PUT /api/classifieds/60d21b4667d0d8992e610c89
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "iPhone 13 Pro Max - 256GB - Price Reduced",
  "price": 210000,
  "description": "Selling my iPhone 13 Pro Max, 256GB storage, Sierra Blue color. Price reduced for quick sale!"
}
```

### 5. Delete Classified Ad

**API Name:** Delete Classified Ad
**Endpoint:** `/classifieds/:id`
**HTTP Method:** DELETE
**Authentication:** Required
**Request Parameters:**
- `id` (string, required): Classified ad ID

**Success Response Example:**

```json
{
  "success": true,
  "data": {}
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Not authorized to delete this classified ad"
}
```

**Sample Postman Request:**

```
DELETE /api/classifieds/60d21b4667d0d8992e610c89
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Seller Dashboard APIs

### 1. Get Seller Dashboard

**API Name:** Get Seller Dashboard
**Endpoint:** `/dashboard/:sellerId`
**HTTP Method:** GET
**Authentication:** Required
**Request Parameters:**
- `sellerId` (string, required): Seller user ID

**Success Response Example:**

```json
{
  "success": true,
  "data": {
    "sellerInfo": {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Seller User",
      "email": "seller@example.com",
      "role": "seller"
    },
    "metrics": {
      "totalListings": 5,
      "activeListings": 4,
      "totalViews": 650,
      "averagePrice": 178000,
      "inquiriesReceived": 42,
      "responseRate": 95,
      "averageResponseTime": "3 hours",
      "sellerRating": "4.8"
    },
    "mostViewedListings": [
      {
        "_id": "60d21b4667d0d8992e610c89",
        "title": "iPhone 13 Pro Max - 256GB - Barely Used",
        "price": 230000,
        "category": "Electronics",
        "region": "Lahore",
        "views": 145,
        "createdAt": "2023-06-19T12:00:00.000Z"
      },
      {
        "_id": "60d21b4667d0d8992e610c91",
        "title": "10 Marla House for Sale in DHA Phase 6",
        "price": 45000000,
        "category": "Real Estate",
        "region": "Lahore",
        "views": 120,
        "createdAt": "2023-06-19T12:00:00.000Z"
      }
    ],
    "recentListings": [
      {
        "_id": "60d21b4667d0d8992e610c92",
        "title": "Samsung Galaxy S21",
        "price": 150000,
        "category": "Electronics",
        "region": "Karachi",
        "views": 35,
        "createdAt": "2023-06-19T14:00:00.000Z"
      },
      {
        "_id": "60d21b4667d0d8992e610c93",
        "title": "Professional Photography Services",
        "price": 25000,
        "category": "Services",
        "region": "Islamabad",
        "views": 15,
        "createdAt": "2023-06-19T13:00:00.000Z"
      }
    ]
  }
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Not authorized to access this dashboard"
}
```

**Sample Postman Request:**

```
GET /api/dashboard/60d21b4667d0d8992e610c85
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Admin Panel APIs

### 1. Get All Users

**API Name:** Get All Users
**Endpoint:** `/admin/users`
**HTTP Method:** GET
**Authentication:** Required (Admin only)

**Success Response Example:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c84",
      "name": "Admin User",
      "email": "admin@linkbzaar.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Seller User",
      "email": "seller@linkbzaar.com",
      "role": "seller",
      "isActive": true,
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Regular User",
      "email": "user@linkbzaar.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    }
  ]
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "User role user is not authorized to access this route"
}
```

**Sample Postman Request:**

```
GET /api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Delete Classified Ad (Admin)

**API Name:** Delete Classified Ad (Admin)
**Endpoint:** `/admin/classifieds/:id`
**HTTP Method:** DELETE
**Authentication:** Required (Admin only)
**Request Parameters:**
- `id` (string, required): Classified ad ID

**Success Response Example:**

```json
{
  "success": true,
  "data": {}
}
```

**Failure Response Example:**

```json
{
  "success": false,
  "message": "Classified ad not found"
}
```

**Sample Postman Request:**

```
DELETE /api/admin/classifieds/60d21b4667d0d8992e610c89
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
