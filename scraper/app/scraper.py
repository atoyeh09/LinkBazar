import random, re
import httpx
import extruct
from w3lib.html import get_base_url
from bs4 import BeautifulSoup
from app.config import USER_AGENTS, HEADERS
from googlesearch import search
import asyncio
from typing import Dict, List, Any, Optional
import json

# Enhanced list of currency symbols and currency codes that can appear in prices
CURRENCY_SYMBOLS = ["$", "₹", "£", "€", "Rs.", "Rs", "PKR", "USD", "₨"]

# More comprehensive regex that captures various price formats
PRICE_REGEX = re.compile(
    r'(?:[$€£₹₨]|Rs\.?|PKR|USD)\s*[,\d]+(?:\.\d{1,2})?|\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s*(?:[$€£₹₨]|Rs\.?|PKR|USD)',
    re.IGNORECASE
)

# Specific regex for price extraction and cleaning
PRICE_EXTRACT_REGEX = re.compile(r'([0-9,]+(?:\.\d{1,2})?)')

# Price context keywords to improve extraction
PRICE_CONTEXT_KEYWORDS = [
    "price", "cost", "total", "pay", "buy", "rs", "$", "₹", "£", "€", "₨", "pkr", "usd"
]

# Minimum price threshold for laptops (to avoid false positives)
MINIMUM_PRICE_THRESHOLD = 50

async def fetch_page(url: str) -> str:
    """Fetch a web page with a random user agent to avoid being blocked."""
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    async with httpx.AsyncClient(follow_redirects=True, timeout=30, headers=headers) as client:
        response = await client.get(url)
        return response.text

def extract_structured_data(html: str, url: str) -> dict:
    """Extract product information from structured data (JSON-LD or Microdata)."""
    data = extruct.extract(html, base_url=get_base_url(html, url), syntaxes=["json-ld", "microdata"])
    for entry in data.get("json-ld", []) + [i.get("properties") for i in data.get("microdata", []) if i.get("properties")]:
        if not entry:
            continue
            
        # Check if it's a product or has product info
        if entry.get("@type", "").lower() == "product" or "price" in entry or "offers" in entry:
            # Extract image from various possible locations
            image = None
            if "image" in entry:
                image = entry["image"]
                # Handle if image is a list or dict
                if isinstance(image, list) and image:
                    image = image[0]
                if isinstance(image, dict) and "url" in image:
                    image = image["url"]
            
            # Extract price information
            price = None
            currency = None
            if "offers" in entry:
                offers = entry["offers"]
                if isinstance(offers, dict):
                    price = safe_float(offers.get("price"))
                    currency = offers.get("priceCurrency")
                elif isinstance(offers, list) and offers:
                    price = safe_float(offers[0].get("price"))
                    currency = offers[0].get("priceCurrency")
            elif "price" in entry:
                price = safe_float(entry.get("price"))
                
            return {
                "title": entry.get("name"),
                "price": price,
                "currency": currency,
                "image": image,
                "description": entry.get("description"),
            }
    return {}

def extract_meta_tags(html: str) -> dict:
    """Extract product information from meta tags."""
    soup = BeautifulSoup(html, "lxml")
    out = {}
    mappings = {
        "og:title": "title",
        "og:description": "description",
        "og:image": "image",
        "og:price:amount": "price",
        "product:price:amount": "price",
        "og:price:currency": "currency",
        "product:price:currency": "currency",
        "twitter:image": "image"
    }
    for prop, key in mappings.items():
        tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
        if tag and tag.get("content"):
            out[key] = tag["content"]
    if "price" in out:
        out["price"] = safe_float(out["price"])
    return out

def extract_price_from_dom(html: str) -> dict:
    """Extract price from the DOM using regex."""
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(separator=" ")
    
    # Look for prices near price indicators first
    for keyword in PRICE_CONTEXT_KEYWORDS:
        pattern = re.compile(rf'{keyword}[^\d]{{0,15}}([0-9,]+(?:\.\d{{1,2}})?)', re.IGNORECASE)
        matches = pattern.findall(text)
        if matches:
            return {
                "price": safe_float(matches[0]),
                "currency": detect_currency(text, matches[0]) or "USD",
            }
    
    # Fall back to general price pattern
    match = PRICE_REGEX.search(text)
    if match:
        price_text = match.group(0)
        currency = detect_currency(price_text)
        price = extract_number_from_price(price_text)
        return {
            "price": price,
            "currency": currency or "USD",
        }
    return {}

def detect_currency(text: str, price_str: str = None) -> Optional[str]:
    """Detect currency symbol or code in text."""
    currency_mapping = {
        "$": "USD", "USD": "USD", "usd": "USD",
        "₹": "INR", "Rs": "PKR", "Rs.": "PKR", "PKR": "PKR", "pkr": "PKR",
        "₨": "PKR",
        "£": "GBP", 
        "€": "EUR"
    }
    
    # Look for currency symbols in the text
    for symbol, code in currency_mapping.items():
        if symbol in text:
            return code
    
    # Default to USD if no currency found
    return "USD"

def extract_number_from_price(price_str: str) -> float:
    """Extract the numeric part from a price string."""
    match = PRICE_EXTRACT_REGEX.search(price_str)
    if match:
        return safe_float(match.group(1))
    return None

def safe_float(val):
    """Convert value to float, handling exceptions and formatting issues."""
    if val is None:
        return None
    try:
        if isinstance(val, str):
            # Remove currency symbols and commas
            for symbol in CURRENCY_SYMBOLS:
                val = val.replace(symbol, "")
            # Handle unicode decimal points or other separators
            val = val.replace(",", "").strip()
        return float(val)
    except (ValueError, TypeError):
        return None

def extract_images(soup: BeautifulSoup, url: str) -> List[str]:
    """Extract product images from the page."""
    images = []
    base_url = get_base_url(str(soup), url)
    
    # 1. Look for product image galleries
    gallery_selectors = [
        '.product-gallery img', '.product-image img', '.product img', 
        '[id*="product"] img', '[class*="product"] img',
        '[id*="gallery"] img', '[class*="gallery"] img',
        '[id*="slider"] img', '[class*="slider"] img',
        'figure img', '.item-image img'
    ]
    
    for selector in gallery_selectors:
        img_elements = soup.select(selector)
        if img_elements:
            for img in img_elements:
                src = img.get('src') or img.get('data-src')
                if src:
                    # Convert relative URLs to absolute
                    abs_url = urljoin_safe(base_url, src)
                    if abs_url and is_likely_product_image(abs_url, img):
                        images.append(abs_url)
    
    # 2. If no gallery found, check for main product image
    if not images:
        main_img_selectors = [
            'meta[property="og:image"]', 'meta[name="twitter:image"]',
            '[id*="main-image"]', '[class*="main-image"]',
            '[id*="featured-image"]', '[class*="featured-image"]',
            '.product-image-main img', '.main-product-image'
        ]
        
        for selector in main_img_selectors:
            elements = soup.select(selector)
            if elements:
                for el in elements:
                    src = el.get('content') or el.get('src') or el.get('data-src')
                    if src:
                        abs_url = urljoin_safe(base_url, src)
                        if abs_url:
                            images.append(abs_url)
                            break
    
    # 3. Last resort: get any reasonably sized image
    if not images:
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and is_likely_product_image(src, img):
                abs_url = urljoin_safe(base_url, src)
                if abs_url:
                    images.append(abs_url)
    
    # Remove duplicates while preserving order
    return list(dict.fromkeys(images))

def urljoin_safe(base: str, url: str) -> Optional[str]:
    """Safely join base URL and relative URL."""
    try:
        from urllib.parse import urljoin
        return urljoin(base, url)
    except:
        return url

def is_likely_product_image(url: str, img_tag) -> bool:
    """Check if an image is likely to be a product image."""
    # Skip very small images, icons, or typical non-product images
    skip_patterns = ['icon', 'logo', 'banner', 'sprite', 'tracking', 'pixel', 'button', 'transparent']
    
    if any(pattern in url.lower() for pattern in skip_patterns):
        return False
        
    # Check image dimensions if available
    width = img_tag.get('width')
    height = img_tag.get('height')
    
    if width and height:
        try:
            w, h = int(width), int(height)
            # Skip very small images
            if w < 100 or h < 100:
                return False
        except (ValueError, TypeError):
            pass
    
    return True

async def scrape_product(url: str) -> Dict[str, Any]:
    """
    Scrape product information from a given URL.
    Enhanced to extract product images and improve price detection.
    """
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30, headers={
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return {"url": url, "error": f"Failed to fetch page: {response.status_code}", "success": False}
            
            html_content = response.text
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract basic product information
            title = soup.title.string if soup.title else "Unknown Title"
            
            # ---- PRODUCT EXTRACTION METHODS (Multiple sources) ----
            
            price = None
            images = []
            description = None
            
            # METHOD 1: Extract from JSON-LD structured data
            structured_data = extract_structured_data(html_content, url)
            if structured_data:
                if structured_data.get("price"):
                    price = structured_data.get("price")
                if structured_data.get("image"):
                    image_url = structured_data.get("image")
                    if isinstance(image_url, list):
                        images.extend(image_url)
                    else:
                        images.append(image_url)
                if structured_data.get("description"):
                    description = structured_data.get("description")
                if structured_data.get("title"):
                    title = structured_data.get("title")
            
            # METHOD 2: Extract from meta tags
            if not price or not images or not description:
                meta_data = extract_meta_tags(html_content)
                if not price and meta_data.get("price"):
                    price = meta_data.get("price")
                if not images and meta_data.get("image"):
                    images.append(meta_data.get("image"))
                if not description and meta_data.get("description"):
                    description = meta_data.get("description")
                if not title and meta_data.get("title"):
                    title = meta_data.get("title")
            
            # METHOD 3: Extract price from DOM
            if not price:
                dom_price_data = extract_price_from_dom(html_content)
                if dom_price_data.get("price"):
                    price = dom_price_data.get("price")
            
            # METHOD 4: Extract images from DOM
            if not images:
                images = extract_images(soup, url)
            
            # METHOD 5: Find description if not found earlier
            if not description:
                desc_elements = soup.select('[class*="description"], [id*="description"], meta[name="description"], [itemprop="description"]')
                if desc_elements:
                    if desc_elements[0].name == "meta":
                        description = desc_elements[0].get('content', '')
                    else:
                        description = desc_elements[0].get_text().strip()
            
            # Apply price validation (skip spuriously low prices)
            if price is not None and isinstance(price, (int, float)) and price < MINIMUM_PRICE_THRESHOLD:
                # Look for another price in the page that's more reasonable
                dom_text = soup.get_text()
                price_matches = re.findall(r'(?:[$€£₹₨]|Rs\.?|PKR|USD)\s*([,\d]+(?:\.\d{1,2})?)', dom_text)
                valid_prices = [safe_float(p.replace(',', '')) for p in price_matches if safe_float(p.replace(',', '')) >= MINIMUM_PRICE_THRESHOLD]
                if valid_prices:
                    price = valid_prices[0]
            
            # Return structured data with images
            return {
                "url": url,
                "title": title,
                "price": price,
                "description": description,
                "images": images[:5] if images else [],  # Limit to first 5 images
                "success": True
            }
    except Exception as e:
        return {"url": url, "error": str(e), "success": False}

async def search_google_and_scrape(query: str, num_results: int = 10, country_code: str = "com"):
    """
    Search Google for the given query, restricted to the given country_code (TLD),
    and scrape product info from the top num_results links.
    Will continue searching until we have num_results complete products with prices and images.
    
    country_code: e.g. 'com', 'co.uk', 'com.pk', etc.
    """
    # Initial variables
    complete_results = []
    searched_urls = set()
    batch_size = min(num_results * 4, 40)  # Search for more results initially
    start_index = 0
    max_attempts = 15  # Increased for more persistence
    attempts = 0
    
    # Continue until we have enough results or run out of attempts
    while len(complete_results) < num_results and attempts < max_attempts:
        # Get more search results
        loop = asyncio.get_event_loop()
        try:
            print(f"Search attempt {attempts+1}/{max_attempts} - Found {len(complete_results)}/{num_results} complete results")
            
            # Add price-related keywords to improve results with pricing
            search_queries = [
                f"{query} price",
                f"{query} buy online",
                f"{query} shop price",
                f"{query} specifications price"
            ]
            
            search_query = search_queries[attempts % len(search_queries)]
            
            # Get a batch of URLs we haven't seen before
            raw_urls = await loop.run_in_executor(
                None, 
                lambda: list(search(
                    search_query,
                    num_results=batch_size,
                    lang="en", 
                    region=country_code, 
                    start_num=start_index,
                    sleep_interval=1  # Add a small delay between requests
                ))
            )
            
            # Filter out URLs we've already seen
            new_urls = []
            for url in raw_urls:
                if url not in searched_urls:
                    new_urls.append(url)
                    searched_urls.add(url)
            
            # If still no new URLs, we've exhausted the search
            if not new_urls:
                print(f"No more new URLs found. Stopping after {len(complete_results)} complete results.")
                break
                
            print(f"Found {len(new_urls)} new URLs to scrape")
            
            # Scrape each result concurrently
            tasks = [scrape_product(url) for url in new_urls]
            results = await asyncio.gather(*tasks)
            
            # Filter for complete results with prices and images
            new_complete_count = 0
            for result in results:
                # Only add results that have a valid price, title, URL and at least one image
                if (result.get("success") and 
                    result.get("price") is not None and 
                    result.get("price") != "" and 
                    result.get("title") and 
                    result.get("url") and
                    result.get("images")):  # Require images
                    
                    # Make sure price is a reasonable value for a laptop
                    if isinstance(result["price"], (int, float)) and result["price"] >= MINIMUM_PRICE_THRESHOLD:
                        complete_results.append(result)
                        new_complete_count += 1
                        
                        # Stop once we have enough complete results
                        if len(complete_results) >= num_results:
                            break
            
            print(f"Found {new_complete_count} new complete results with prices and images in this batch")
            
            # Prepare for the next batch
            start_index += batch_size
            attempts += 1
            
            # If we're making progress, be more lenient with attempts
            if new_complete_count > 0:
                attempts = min(attempts, max_attempts - 3)  # More forgiving approach
                print("Making progress, adjusting attempt counter")
                
        except Exception as e:
            print(f"Error in search batch: {e}")
            attempts += 1
    
    # If we couldn't find enough results with all the specified criteria,
    # return what we have
    if len(complete_results) < num_results:
        print(f"Could only find {len(complete_results)} complete results after exhaustive search.")
    
    return {"results": complete_results[:num_results]}