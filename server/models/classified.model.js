const mongoose = require('mongoose');

const ClassifiedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
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
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: [
        'Islamabad',
        'Karachi',
        'Lahore',
        'Peshawar',
        'Quetta',
        'Multan',
        'Faisalabad',
        'Rawalpindi',
        'Hyderabad',
        'Sialkot',
        'Other'
      ]
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
    images: [
      {
        type: String,
        required: [true, 'At least one image is required']
      }
    ],
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'New'
    },
    contactPhone: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    sellerId: {
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
ClassifiedSchema.index({
  title: 'text',
  description: 'text'
});

module.exports = mongoose.model('Classified', ClassifiedSchema);
