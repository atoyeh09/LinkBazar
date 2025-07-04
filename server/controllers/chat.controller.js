const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Classified = require('../models/classified.model');

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .populate({
        path: 'relatedTo.itemId',
        select: 'name title images price',
      })
      .sort({ updatedAt: -1 });

    // Format the response
    const formattedConversations = conversations.map(conversation => {
      // Get the other participant (not the current user)
      const otherParticipant = conversation.participants.find(
        participant => participant._id.toString() !== req.user._id.toString()
      );

      // Get unread count for current user
      const unreadCount = conversation.unreadCount.get(req.user._id.toString()) || 0;

      return {
        _id: conversation._id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        unreadCount,
        relatedTo: conversation.relatedTo,
        updatedAt: conversation.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email profilePicture')
      .populate({
        path: 'relatedTo.itemId',
        select: 'name title images price seller sellerId',
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Get the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      participant => participant._id.toString() !== req.user._id.toString()
    );

    // Format the response
    const formattedConversation = {
      _id: conversation._id,
      otherParticipant,
      relatedTo: conversation.relatedTo,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedConversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new conversation
// @route   POST /api/chat/conversations
// @access  Private
exports.createConversation = async (req, res) => {
  try {
    const { participantId, itemType, itemId } = req.body;

    if (!participantId || !itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if the item exists
    let item;
    if (itemType === 'Product') {
      item = await Product.findById(itemId);
    } else if (itemType === 'Classified') {
      item = await Classified.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${itemType} not found`
      });
    }

    // Check if the participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if a conversation already exists between these users about this item
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      'relatedTo.itemType': itemType,
      'relatedTo.itemId': itemId
    });

    // If conversation exists, return it
    if (conversation) {
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email profilePicture')
        .populate({
          path: 'relatedTo.itemId',
          select: 'name title images price',
        });

      // Get the other participant
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: {
          _id: conversation._id,
          otherParticipant,
          relatedTo: conversation.relatedTo,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      });
    }

    // Create a new conversation
    const newConversation = await Conversation.create({
      participants: [req.user._id, participantId],
      relatedTo: {
        itemType,
        itemId
      },
      unreadCount: {
        [participantId]: 0,
        [req.user._id]: 0
      }
    });

    // Populate the conversation
    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate('participants', 'name email profilePicture')
      .populate({
        path: 'relatedTo.itemId',
        select: 'name title images price',
      });

    // Get the other participant
    const otherParticipant = populatedConversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    res.status(201).json({
      success: true,
      data: {
        _id: populatedConversation._id,
        otherParticipant,
        relatedTo: populatedConversation.relatedTo,
        createdAt: populatedConversation.createdAt,
        updatedAt: populatedConversation.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if conversation exists
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages
    const messages = await Message.find({
      conversationId: id,
      isDeleted: false
    })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Message.countDocuments({
      conversationId: id,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      data: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if conversation exists
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    // Reset unread count for the user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
