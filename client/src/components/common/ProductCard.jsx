import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`}>
      <Card hover className="h-full transition-all duration-300">
        <div className="relative aspect-square overflow-hidden rounded-t-apple">
          <img
            src={product.images[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {product.condition && (
            <div className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-800 shadow-sm">
              {product.condition}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {product.brand && <span className="font-medium">{product.brand} • </span>}
            {product.category}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              Rs. {product.price.toLocaleString()}
            </p>
            {product.seller && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                by {product.seller.name}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
