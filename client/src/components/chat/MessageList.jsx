import React, { useEffect, useRef } from 'react';
import { Avatar } from '../common';
import { LoadingSpinner } from '../common';
import { formatTime } from '../../utils/dateUtils';

const MessageList = ({ messages, currentUserId, loadingMessages }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loadingMessages) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender._id === currentUserId;
            
            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isCurrentUser && (
                    <div className="mr-2 flex-shrink-0">
                      <Avatar
                        src={message.sender.profilePicture}
                        name={message.sender.name}
                        size="sm"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-200 dark:text-black'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <div
                      className={`mt-1 flex items-center text-xs text-gray-500 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{formatTime(new Date(message.createdAt))}</span>
                      
                      {isCurrentUser && message.readBy && message.readBy.length > 1 && (
                        <span className="ml-2 text-blue-500">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
