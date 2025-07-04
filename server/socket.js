const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');

// Map to store active users and their socket IDs
const activeUsers = new Map();

const setupSocketIO = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Add user to active users map
    activeUsers.set(socket.user._id.toString(), socket.id);
    
    // Join user to their own room for private messages
    socket.join(socket.user._id.toString());
    
    // Emit online status to all users
    io.emit('userStatus', {
      userId: socket.user._id,
      status: 'online'
    });

    // Handle joining a conversation
    socket.on('joinConversation', async (conversationId) => {
      try {
        // Join the conversation room
        socket.join(conversationId);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId, socket.user._id);
        
        // Notify other participants that user has read messages
        socket.to(conversationId).emit('messagesRead', {
          conversationId,
          userId: socket.user._id
        });
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });

    // Handle leaving a conversation
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content } = data;
        
        // Create new message
        const newMessage = await Message.create({
          conversationId,
          sender: socket.user._id,
          content,
          readBy: [socket.user._id] // Mark as read by sender
        });
        
        // Populate sender info
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name email profilePicture')
          .lean();
        
        // Update conversation with last message
        const conversation = await Conversation.findById(conversationId);
        conversation.lastMessage = newMessage._id;
        
        // Increment unread count for all participants except sender
        for (const participantId of conversation.participants) {
          if (participantId.toString() !== socket.user._id.toString()) {
            const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
            conversation.unreadCount.set(participantId.toString(), currentCount + 1);
          }
        }
        
        await conversation.save();
        
        // Emit message to all users in the conversation
        io.to(conversationId).emit('newMessage', populatedMessage);
        
        // Send notification to offline users
        for (const participantId of conversation.participants) {
          if (
            participantId.toString() !== socket.user._id.toString() && 
            activeUsers.has(participantId.toString())
          ) {
            io.to(participantId.toString()).emit('messageNotification', {
              conversationId,
              message: populatedMessage
            });
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      
      // Remove user from active users map
      activeUsers.delete(socket.user._id.toString());
      
      // Emit offline status to all users
      io.emit('userStatus', {
        userId: socket.user._id,
        status: 'offline'
      });
    });
  });
};

// Helper function to mark messages as read
async function markMessagesAsRead(conversationId, userId) {
  try {
    // Find all unread messages in the conversation
    const unreadMessages = await Message.find({
      conversationId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    });
    
    // Mark messages as read
    await Promise.all(
      unreadMessages.map(message => 
        Message.findByIdAndUpdate(
          message._id,
          { $addToSet: { readBy: userId } }
        )
      )
    );
    
    // Reset unread count for the user
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );
    
    return unreadMessages.length;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

module.exports = setupSocketIO;
