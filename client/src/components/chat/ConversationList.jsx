import React from 'react';
import { Avatar } from '../common';
import { formatDistanceToNow } from '../../utils/dateUtils';

const ConversationList = ({ conversations, activeId, onSelectConversation, currentUserId }) => {
  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <li
            key={conversation._id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              activeId === conversation._id ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center p-4">
              <div className="relative">
                <Avatar
                  src={conversation.otherParticipant.profilePicture}
                  name={conversation.otherParticipant.name}
                  size="md"
                />
                {conversation.unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-black">
                    {conversation.otherParticipant.name}
                  </p>
                  {conversation.updatedAt && (
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updatedAt))}
                    </p>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {conversation.lastMessage.sender === currentUserId ? 'You: ' : ''}
                    {conversation.lastMessage.content}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {conversation.relatedTo.itemType === 'Product' ? 'Product' : 'Classified Ad'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
