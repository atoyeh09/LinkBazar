import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ChatService } from '../services';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated() && user) {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });
      
      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
      
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setError(error.message);
      });
      
      // Set socket state
      setSocket(newSocket);
      
      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      const response = await ChatService.getConversations();
      
      if (response.success) {
        setConversations(response.data);
        
        // Calculate total unread count
        const totalUnread = response.data.reduce(
          (total, conversation) => total + conversation.unreadCount,
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId, page = 1, limit = 20) => {
    if (!isAuthenticated() || !conversationId) return;
    
    try {
      setLoading(true);
      const response = await ChatService.getMessages(conversationId, page, limit);
      
      if (response.success) {
        if (page === 1) {
          // Replace messages if it's the first page
          setMessages(response.data);
        } else {
          // Prepend older messages
          setMessages(prevMessages => [...response.data, ...prevMessages]);
        }
        
        // Mark messages as read
        await ChatService.markAsRead(conversationId);
        
        // Update unread count in conversations
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
        
        // Recalculate total unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - response.data.length));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Set active conversation
  const setConversationActive = useCallback(async (conversationId) => {
    if (!isAuthenticated() || !conversationId) return;
    
    try {
      setLoading(true);
      
      // Get conversation details
      const response = await ChatService.getConversation(conversationId);
      
      if (response.success) {
        setActiveConversation(response.data);
        
        // Join the conversation room
        if (socket && connected) {
          socket.emit('joinConversation', conversationId);
        }
        
        // Load messages
        await loadMessages(conversationId);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, socket, connected, loadMessages]);

  // Create a new conversation
  const createConversation = useCallback(async (participantId, itemType, itemId) => {
    if (!isAuthenticated()) return null;
    
    try {
      setLoading(true);
      const response = await ChatService.createConversation(participantId, itemType, itemId);
      
      if (response.success) {
        // Add to conversations if it's new
        const exists = conversations.some(conv => conv._id === response.data._id);
        
        if (!exists) {
          setConversations(prevConversations => [response.data, ...prevConversations]);
        }
        
        return response.data;
      }
      
      return null;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, conversations]);

  // Send a message
  const sendMessage = useCallback((conversationId, content) => {
    if (!socket || !connected || !conversationId || !content.trim()) {
      return false;
    }
    
    socket.emit('sendMessage', { conversationId, content });
    return true;
  }, [socket, connected]);

  // Set up socket event listeners for messages
  useEffect(() => {
    if (!socket) return;
    
    // Handle new messages
    const handleNewMessage = (message) => {
      // Add message to current conversation if active
      if (activeConversation && message.conversationId === activeConversation._id) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Mark as read if it's from the other user
        if (message.sender._id !== user._id) {
          ChatService.markAsRead(message.conversationId);
        }
      } else {
        // Increment unread count for other conversations
        if (message.sender._id !== user._id) {
          setUnreadCount(prevCount => prevCount + 1);
          
          // Update conversation unread count
          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv._id === message.conversationId
                ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: message }
                : conv
            )
          );
        }
      }
    };
    
    // Handle message notifications
    const handleMessageNotification = (data) => {
      // Update conversation with new message
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv._id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.message,
                unreadCount: (conv.unreadCount || 0) + 1,
                updatedAt: new Date().toISOString()
              }
            : conv
        )
      );
      
      // Increment total unread count
      setUnreadCount(prevCount => prevCount + 1);
    };
    
    // Handle messages read
    const handleMessagesRead = (data) => {
      // Update messages readBy status if in active conversation
      if (activeConversation && data.conversationId === activeConversation._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg => ({
            ...msg,
            readBy: msg.sender._id === user._id ? [...msg.readBy, data.userId] : msg.readBy
          }))
        );
      }
    };
    
    // Register event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageNotification', handleMessageNotification);
    socket.on('messagesRead', handleMessagesRead);
    
    // Clean up
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageNotification', handleMessageNotification);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, activeConversation, user]);

  // Load conversations on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated()) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loading,
        error,
        unreadCount,
        connected,
        loadConversations,
        loadMessages,
        setConversationActive,
        createConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
