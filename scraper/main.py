from fastapi import FastAPI, HTTPException
import httpx
from app.schemas import ScrapeRequest, ScrapeResponse, GoogleSearchScrapeRequest
from app.scraper import scrape_product, search_google_and_scrape

app = FastAPI(title="Generic Product Scraper API", version="1.0")

@app.post("/search-and-scrape", tags=["Google Search & Scrape"])
async def search_and_scrape(request: GoogleSearchScrapeRequest):
    try:
        results = await search_google_and_scrape(request.query, request.num_results, request.country_code)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the Generic Scraper API 🚀"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    try:
        result = await scrape_product(request.url)
        if not result.get("price") or not result.get("title"):
            raise HTTPException(status_code=404, detail="Product info not found")
        return result
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"HTTP Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")
