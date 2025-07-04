import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

const EmptyState = ({
  title = 'No results found',
  description = "We couldn't find what you're looking for.",
  icon,
  action,
  actionText = 'Go back',
  actionLink = '/',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon || (
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      )}
      <h3 className="mb-2 text-lg font-medium text-gray-800">{title}</h3>
      <p className="mb-6 text-gray-600 dark:text-gray-400">{description}</p>
      {action ? (
        <Button variant="primary" onClick={typeof action === 'function' ? action : undefined}>
          {actionText}
        </Button>
      ) : (
        <Link to={actionLink}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
