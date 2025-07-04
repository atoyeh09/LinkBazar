import React, { useState, useEffect } from 'react';
import { getAvatarColor, getInitials, isValidImageUrl } from '../../utils/avatarUtils';

/**
 * Avatar component that displays either an image or name initials
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.name - User's name for fallback
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.size - Size of the avatar (sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({ src, name, alt, size = 'md', className = '' }) => {
  const [imgValid, setImgValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateImage = async () => {
      setIsLoading(true);
      if (!src) {
        setImgValid(false);
        setIsLoading(false);
        return;
      }
      
      const isValid = await isValidImageUrl(src);
      setImgValid(isValid);
      setIsLoading(false);
    };
    
    validateImage();
  }, [src]);

  // Determine size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // If image is valid, render the image
  if (imgValid && !isLoading) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setImgValid(false)}
      />
    );
  }
  
  // Otherwise, render initials
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
