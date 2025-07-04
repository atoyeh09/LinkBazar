const express = require('express');
const router = express.Router();
const axios = require('axios');

// Scraper API base URL
const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://localhost:8000';

// Proxy route for search-and-scrape
router.post('/search-and-scrape', async (req, res) => {
  try {
    const { query, num_results, country_code } = req.body;

    const response = await axios.post(`${SCRAPER_API_URL}/search-and-scrape`, {
      query,
      num_results: num_results || 5,
      country_code: country_code || 'com'
    });

    // Log the response structure for debugging
    console.log('Scraper API response structure:', JSON.stringify(response.data, null, 2));

    // Handle the nested results structure
    if (response.data && response.data.results) {
      // Check if results is an object with its own results array
      if (response.data.results.results && Array.isArray(response.data.results.results)) {
        console.log(`Found ${response.data.results.results.length} results in nested structure`);
        // Flatten the nested structure
        res.json({ results: response.data.results.results });
      }
      // Check if results is directly an array
      else if (Array.isArray(response.data.results)) {
        console.log(`Found ${response.data.results.length} results in response.data.results`);
        res.json(response.data);
      }
      else {
        console.warn('Unexpected results format:', typeof response.data.results);
        res.json({ results: [] });
      }
    }
    // Handle direct array response
    else if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} results in response.data array`);
      res.json({ results: response.data });
    }
    // Handle unexpected format
    else {
      console.warn('Unexpected response format from scraper API:', typeof response.data);
      res.json({ results: [] });
    }
  } catch (error) {
    console.error('Error in scraper proxy:', error.message);

    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return a more detailed error response
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      error: error.response?.data || 'Internal server error',
      // Return empty results array to prevent frontend errors
      results: []
    });
  }
});

// Proxy route for scrape
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    const response = await axios.post(`${SCRAPER_API_URL}/scrape`, { url });

    res.json(response.data);
  } catch (error) {
    console.error('Error in scraper proxy:', error.message);

    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return a more detailed error response
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      error: error.response?.data || 'Internal server error'
    });
  }
});

module.exports = router;
