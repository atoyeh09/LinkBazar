import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui';

const ClassifiedCard = ({ classified }) => {
  return (
    <Link to={`/classifieds/${classified._id}`}>
      <Card hover className="h-full transition-all duration-300">
        <div className="relative aspect-video overflow-hidden rounded-t-apple">
          <img
            src={classified.images[0] || 'https://via.placeholder.com/300x200'}
            alt={classified.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {classified.isPromoted && (
            <div className="absolute left-0 top-0 bg-secondary-600 px-2 py-1 text-xs font-medium text-white">
              Featured
            </div>
          )}
          {classified.condition && (
            <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-800 shadow-sm">
              {classified.condition}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              Rs. {classified.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(classified.createdAt).toLocaleDateString()}
            </p>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{classified.title}</h3>
          <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {classified.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {classified.region}
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              {classified.views} views
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ClassifiedCard;
