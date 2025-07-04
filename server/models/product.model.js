const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Clothing',
        'Furniture',
        'Books',
        'Vehicles',
        'Real Estate',
        'Services',
        'Jobs',
        'Others'
      ]
    },
    brand: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'New'
    },
    images: [
      {
        type: String,
        required: [true, 'At least one image is required']
      }
    ],
    url: {
      type: String,
      trim: true
    },
    keywords: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller information is required']
    }
  },
  {
    timestamps: true
  }
);

// Create index for text search
ProductSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  keywords: 'text',
  url: 'text'
});

module.exports = mongoose.model('Product', ProductSchema);
