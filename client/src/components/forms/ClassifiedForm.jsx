import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Select, Textarea } from '../ui';
import { LoadingSpinner, LocationPicker } from '../common';

const ClassifiedForm = ({ initialData = {}, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    region: '',
    condition: 'New',
    contactPhone: '',
    contactEmail: '',
    images: [''],
    location: {
      type: 'Point',
      coordinates: [] // [longitude, latitude]
    },
    ...initialData
  });
  const [errors, setErrors] = useState({});

  // Categories for dropdown
  const categories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Vehicles',
    'Real Estate',
    'Services',
    'Jobs',
    'Others'
  ];

  // Regions for dropdown
  const regions = [
    'Islamabad',
    'Karachi',
    'Lahore',
    'Peshawar',
    'Quetta',
    'Multan',
    'Faisalabad',
    'Rawalpindi',
    'Hyderabad',
    'Sialkot',
    'Other'
  ];

  // Conditions for dropdown
  const conditions = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleLocationChange = (location) => {
    if (location && location.lat && location.lng) {
      setFormData(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat] // MongoDB uses [longitude, latitude] format
        }
      }));

      // Clear location error if it exists
      if (errors.location) {
        setErrors(prev => ({
          ...prev,
          location: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.region) {
      newErrors.region = 'Region is required';
    }

    // Validate location
    if (!formData.location.coordinates || formData.location.coordinates.length !== 2) {
      newErrors.location = 'Please select a location on the map';
    }

    // Validate images
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.images = 'At least one image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Filter out empty image URLs
      const cleanedData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== '')
      };

      onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title for your ad"
            error={errors.title}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about what you're selling"
            rows={6}
            error={errors.description}
            required
          />
        </div>

        <div>
          <Input
            label="Price (Rs.)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price in Pakistani Rupees"
            error={errors.price}
            required
          />
        </div>

        <div>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            error={errors.region}
            required
          >
            <option value="">Select a region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Input
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="e.g., +92 300 1234567"
          />
        </div>

        <div>
          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="e.g., your.email@example.com"
          />
        </div>

        <div className="md:col-span-2 mb-6">
          <LocationPicker
            initialLocation={
              formData.location && formData.location.coordinates && formData.location.coordinates.length === 2
                ? { lng: formData.location.coordinates[0], lat: formData.location.coordinates[1] }
                : null
            }
            onLocationChange={handleLocationChange}
            label="Location"
            error={errors.location}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Images <span className="text-red-500">*</span>
          </label>

          {formData.images.map((image, index) => (
            <div key={index} className="mb-2 flex items-center space-x-2">
              <Input
                name={`image-${index}`}
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="Enter image URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeImageField(index)}
                disabled={formData.images.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}

          {errors.images && (
            <p className="mt-1 text-xs text-red-500">{errors.images}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
            className="mt-2"
          >
            Add Another Image
          </Button>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </div>
          ) : (
            initialData._id ? 'Update Classified Ad' : 'Post Classified Ad'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ClassifiedForm;
