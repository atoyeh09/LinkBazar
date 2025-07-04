import api from './api';

const ChatService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get a single conversation by ID
  getConversation: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // Create a new conversation
  createConversation: async (participantId, itemType, itemId) => {
    const response = await api.post('/chat/conversations', {
      participantId,
      itemType,
      itemId
    });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 1, limit = 20) => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    const response = await api.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  }
};

export default ChatService;
