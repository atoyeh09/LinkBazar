import api from './api';

const ScraperService = {
  // Search and scrape products from the web
  searchAndScrape: async (query, options = {}) => {
    const { numResults = 5, countryCode = 'com' } = options;

    // Add retry mechanism
    const maxRetries = 2;
    let retries = 0;
    let lastError = null;

    while (retries <= maxRetries) {
      try {
        console.log(`Attempt ${retries + 1}/${maxRetries + 1} to fetch scraped products...`);

        const response = await api.post('/scraper/search-and-scrape', {
          query,
          num_results: numResults,
          country_code: countryCode
        });

        // Log the full response for debugging
        console.log(`Attempt ${retries + 1} successful!`);
        console.log('ScraperService full response:', JSON.stringify(response.data, null, 2));

        // Handle different response structures
        if (response.data && response.data.results) {
          // Check for nested results structure
          if (response.data.results.results && Array.isArray(response.data.results.results)) {
            console.log(`Found ${response.data.results.results.length} results in nested structure`);
            return { results: response.data.results.results };
          }
          // Check for direct results array
          else if (Array.isArray(response.data.results)) {
            console.log(`Found ${response.data.results.length} results in response.data.results`);
            return response.data;
          }
          else {
            console.warn('Unexpected results format:', typeof response.data.results);
            // Don't return yet, try again if we have retries left
            lastError = new Error('Unexpected results format');
          }
        }
        // Handle direct array response
        else if (Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} results in response.data array`);
          return { results: response.data };
        }
        // Handle unexpected format
        else {
          console.warn('Unexpected response format from scraper API:', typeof response.data);
          // Don't return yet, try again if we have retries left
          lastError = new Error('Unexpected response format');
        }

        // If we got here without returning, the response wasn't what we expected
        // But we got a response, so increment retries and try again
        retries++;

        if (retries <= maxRetries) {
          console.log(`Retrying... (${retries}/${maxRetries})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          // We've exhausted our retries, return empty results
          console.error('All retry attempts failed');
          return { results: [] };
        }

      } catch (error) {
        // Log detailed error information
        console.error(`Error in searchAndScrape (attempt ${retries + 1}):`, error);

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
        }

        lastError = error;

        retries++;
        if (retries <= maxRetries) {
          console.log(`Retrying after error... (${retries}/${maxRetries})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          // We've exhausted our retries
          console.error('All retry attempts failed');
          return { results: [] };
        }
      }
    }

    // If we get here, all retries failed
    console.error('All retry attempts failed:', lastError);
    return { results: [] };
  },

  // Scrape a specific product URL
  scrapeProduct: async (url) => {
    try {
      const response = await api.post('/scraper/scrape', { url });
      return response.data;
    } catch (error) {
      console.error('Error in scrapeProduct:', error);
      throw error;
    }
  }
};

export default ScraperService;
