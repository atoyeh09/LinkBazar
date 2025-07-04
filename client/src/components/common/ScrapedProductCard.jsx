import React from 'react';
import { Card } from '../ui';

const ScrapedProductCard = ({ product = {} }) => {
  // Function to open the product URL in a new tab
  const handleClick = () => {
    if (product?.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Debug the product data
  console.log('ScrapedProductCard received:', product);

  // Check if product is valid
  if (!product || typeof product !== 'object') {
    console.warn('Invalid product data received:', product);
    return null;
  }

  // Get a valid image URL
  const imageUrl = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300';

  // Check if the image URL is a data URL or SVG and replace if needed
  const isDataUrl = imageUrl && (
    imageUrl.startsWith('data:') ||
    imageUrl.includes('<svg') ||
    imageUrl.includes('removebg')
  );

  const finalImageUrl = isDataUrl
    ? 'https://via.placeholder.com/300'
    : imageUrl;

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card hover className="h-full transition-all duration-300">
        <div className="relative aspect-square overflow-hidden rounded-t-apple">
          <img
            src={finalImageUrl}
            alt={product.title || 'Product Image'}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300';
            }}
          />
          <div className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
            Web Result
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
            {product.title || 'Product Title Not Available'}
          </h3>
          <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {product.description?.substring(0, 100) || 'No description available'}
          </p>
          <div className="flex items-center justify-between">
            {product.price ? (
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {typeof product.price === 'number'
                  ? `Rs. ${product.price.toLocaleString()}`
                  : `Rs. ${product.price}`}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Price not available</p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              External Link
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScrapedProductCard;
