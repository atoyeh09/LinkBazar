import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="rounded-apple bg-white p-4 shadow-apple dark:bg-gray-800">
            <div className="aspect-square w-full animate-pulse rounded-apple bg-gray-300 dark:bg-gray-700"></div>
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="mt-4 flex justify-between">
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-6 w-1/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex animate-pulse items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
