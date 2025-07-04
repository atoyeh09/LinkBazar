/**
 * Generates a consistent color based on a string (like a name)
 * @param {string} name - The name to generate a color for
 * @returns {string} - A hex color code
 */
export const getAvatarColor = (name) => {
  // Default color if no name is provided
  if (!name) return '#6366F1'; // Indigo color
  
  // Generate a hash code from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // List of pleasant, accessible colors for avatars
  const colors = [
    '#F87171', // Red
    '#FB923C', // Orange
    '#FBBF24', // Amber
    '#A3E635', // Lime
    '#34D399', // Emerald
    '#22D3EE', // Cyan
    '#60A5FA', // Blue
    '#818CF8', // Indigo
    '#A78BFA', // Violet
    '#E879F9', // Fuchsia
    '#F472B6', // Pink
  ];
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Gets the initials from a name
 * @param {string} name - The full name
 * @returns {string} - The initials (up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  // Split the name by spaces and get the first letter of each part
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    // If only one name, return the first letter
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Return the first letter of the first and last parts
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Checks if an image URL is valid and accessible
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - Whether the image is valid
 */
export const isValidImageUrl = async (url) => {
  if (!url) return false;
  
  // Skip validation for data URLs (they're already loaded)
  if (url.startsWith('data:')) return true;
  
  // Skip validation for relative URLs (assume they're valid)
  if (!url.startsWith('http')) return true;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
};
