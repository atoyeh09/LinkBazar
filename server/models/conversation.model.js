const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    // Reference to the product or classified that initiated the conversation
    relatedTo: {
      itemType: {
        type: String,
        enum: ['Product', 'Classified'],
        required: true
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedTo.itemType'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure participants are unique
ConversationSchema.index({ participants: 1 });

// Create a compound index for finding conversations between two users about a specific item
ConversationSchema.index(
  { 
    participants: 1, 
    'relatedTo.itemType': 1, 
    'relatedTo.itemId': 1 
  },
  { 
    unique: true 
  }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
