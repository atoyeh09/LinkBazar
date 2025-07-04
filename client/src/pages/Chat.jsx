import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import { LoadingSpinner, Avatar, EmptyState } from '../components/common';
import ConversationList from '../components/chat/ConversationList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    loadConversations,
    setConversationActive,
    sendMessage
  } = useChat();
  const [messageText, setMessageText] = useState('');

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Set active conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setConversationActive(conversationId);
    }
  }, [conversationId, setConversationActive]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;

    const success = sendMessage(activeConversation._id, messageText);
    if (success) {
      setMessageText('');
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    navigate(`/chat/${conversation._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-black">Messages</h1>

      {loading && !conversations.length ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-[600px] overflow-hidden">
              <div className="flex h-full flex-col">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                </div>
                
                {conversations.length === 0 ? (
                  <EmptyState
                    title="No conversations yet"
                    description="Start a conversation by messaging a seller from a product or classified ad page."
                    className="h-full"
                  />
                ) : (
                  <ConversationList
                    conversations={conversations}
                    activeId={activeConversation?._id}
                    onSelectConversation={handleSelectConversation}
                    currentUserId={user?._id}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              {!activeConversation ? (
                <EmptyState
                  title="Select a conversation"
                  description="Choose a conversation from the list to start chatting."
                  className="h-full"
                />
              ) : (
                <div className="flex h-full flex-col">
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center">
                      <Avatar
                        src={activeConversation.otherParticipant.profilePicture}
                        name={activeConversation.otherParticipant.name}
                        size="md"
                      />
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {activeConversation.otherParticipant.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {activeConversation.relatedTo.itemType === 'Product' ? 'Product' : 'Classified Ad'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <MessageList
                    messages={messages}
                    currentUserId={user?._id}
                    loadingMessages={loading}
                  />

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <MessageInput
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onSend={handleSendMessage}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
