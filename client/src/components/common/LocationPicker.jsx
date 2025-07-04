import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMapComponent } from './index';
import { Input, Button } from '../ui';

/**
 * LocationPicker - A component for picking a location using Google Maps
 * @param {Object} props - Component props
 * @param {Object} props.initialLocation - Initial location coordinates { lat, lng }
 * @param {Function} props.onLocationChange - Callback when location changes
 * @param {string} props.label - Label for the location input
 * @param {string} props.error - Error message to display
 */
const LocationPicker = ({ 
  initialLocation, 
  onLocationChange, 
  label = 'Location', 
  error = '' 
}) => {
  const [location, setLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Update address when location changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      // Reverse geocode to get address from coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: location.lat, lng: location.lng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            setAddress(results[0].formatted_address);
          }
        }
      );
    }
  }, [location]);

  // Handle location change from map
  const handleLocationChange = useCallback((newLocation) => {
    setLocation(newLocation);
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  }, [onLocationChange]);

  // Handle search for address
  const handleSearch = useCallback(() => {
    if (!searchQuery) return;

    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results[0]) {
        const newLocation = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        setLocation(newLocation);
        setAddress(results[0].formatted_address);
        if (onLocationChange) {
          onLocationChange(newLocation);
        }
      }
    });
  }, [searchQuery, onLocationChange]);

  // Handle key press in search input
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="location-picker">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="mb-4 flex">
        <Input
          type="text"
          placeholder="Search for a location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery}
          className="ml-2"
        >
          Search
        </Button>
      </div>
      
      <GoogleMapComponent
        location={location}
        onLocationChange={handleLocationChange}
        isEditable={true}
      />
      
      {address && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Selected address: {address}
        </div>
      )}
      
      {error && (
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
