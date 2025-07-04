import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 30.3753, // Default center (Pakistan)
  lng: 69.3451
};

const libraries = ['places'];

/**
 * GoogleMapComponent - A reusable Google Maps component
 * @param {Object} props - Component props
 * @param {Object} props.location - Location coordinates { lat, lng }
 * @param {Function} props.onLocationChange - Callback when location changes
 * @param {boolean} props.isEditable - Whether the map is editable (can place markers)
 * @param {string} props.title - Title for the marker info window
 * @param {string} props.description - Description for the marker info window
 */
const GoogleMapComponent = ({ 
  location, 
  onLocationChange, 
  isEditable = false, 
  title = '', 
  description = '' 
}) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [center, setCenter] = useState(location || defaultCenter);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Update center when location prop changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setCenter(location);
    }
  }, [location]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onMarkerLoad = useCallback((marker) => {
    setMarker(marker);
  }, []);

  const onInfoWindowLoad = useCallback((infoWindow) => {
    setInfoWindow(infoWindow);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (isEditable) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setCenter(newLocation);
      if (onLocationChange) {
        onLocationChange(newLocation);
      }
    }
  }, [isEditable, onLocationChange]);

  const toggleInfoWindow = useCallback(() => {
    setIsInfoOpen(!isInfoOpen);
  }, [isInfoOpen]);

  if (loadError) {
    return <div className="p-4 text-center text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4 text-center">Loading Google Maps...</div>;
  }

  return (
    <div className="google-map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          zoomControl: true,
        }}
      >
        {center && (
          <Marker
            position={center}
            onLoad={onMarkerLoad}
            onClick={toggleInfoWindow}
            draggable={isEditable}
            onDragEnd={(e) => {
              if (isEditable && onLocationChange) {
                const newLocation = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                };
                setCenter(newLocation);
                onLocationChange(newLocation);
              }
            }}
          >
            {isInfoOpen && (title || description) && (
              <InfoWindow
                onLoad={onInfoWindowLoad}
                onCloseClick={toggleInfoWindow}
              >
                <div className="info-window">
                  {title && <h3 className="font-bold">{title}</h3>}
                  {description && <p>{description}</p>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
      {isEditable && (
        <p className="mt-2 text-sm text-gray-500">
          Click on the map or drag the marker to set the location
        </p>
      )}
    </div>
  );
};

export default GoogleMapComponent;
