from pydantic import BaseModel
from typing import Optional

class ScrapeRequest(BaseModel):
    url: str

class ScrapeResponse(BaseModel):
    title: Optional[str]
    price: Optional[float]
    currency: Optional[str]
    image: Optional[str]
    description: Optional[str]
    url: str

class GoogleSearchScrapeRequest(BaseModel):
    query: str
    num_results: int = 5
    country_code: str = "com"
