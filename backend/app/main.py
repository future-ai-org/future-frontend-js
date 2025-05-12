from datetime import datetime
from typing import Dict, List, Optional

import ephem
import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# API Configuration
API_CONFIG = {
    "title": "Astrological API",
    "description": """
    A comprehensive API for astrological calculations and information.
    
    ## Features
    * Calculate planetary positions
    * Get zodiac sign information
    * Determine zodiac signs for specific dates
    
    ## Usage
    All dates should be provided in YYYY-MM-DD format.
    """,
    "version": "1.0.0",
    "docs_url": "/docs",
    "redoc_url": "/redoc",
    "openapi_url": "/openapi.json"
}

# Initialize FastAPI app
app = FastAPI(**API_CONFIG)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PlanetPosition(BaseModel):
    """Model representing a planet's position in space."""
    name: str = Field(..., description="Name of the planet")
    longitude: float = Field(..., description="Ecliptic longitude in degrees")
    latitude: float = Field(..., description="Ecliptic latitude in degrees")
    distance: float = Field(..., description="Distance from Earth in AU")
    constellation: str = Field(..., description="Current zodiac constellation")

class ZodiacSign(BaseModel):
    """Model representing zodiac sign information."""
    name: str = Field(..., description="Name of the zodiac sign")
    start_date: str = Field(..., description="Start date in MM-DD format")
    end_date: str = Field(..., description="End date in MM-DD format")
    element: str = Field(..., description="Associated element (Fire, Earth, Air, Water)")
    quality: str = Field(..., description="Sign quality (Cardinal, Fixed, Mutable)")

# Constants
ZODIAC_SIGNS = {
    "Aries": {"start": "03-21", "end": "04-19", "element": "Fire", "quality": "Cardinal"},
    "Taurus": {"start": "04-20", "end": "05-20", "element": "Earth", "quality": "Fixed"},
    "Gemini": {"start": "05-21", "end": "06-20", "element": "Air", "quality": "Mutable"},
    "Cancer": {"start": "06-21", "end": "07-22", "element": "Water", "quality": "Cardinal"},
    "Leo": {"start": "07-23", "end": "08-22", "element": "Fire", "quality": "Fixed"},
    "Virgo": {"start": "08-23", "end": "09-22", "element": "Earth", "quality": "Mutable"},
    "Libra": {"start": "09-23", "end": "10-22", "element": "Air", "quality": "Cardinal"},
    "Scorpio": {"start": "10-23", "end": "11-21", "element": "Water", "quality": "Fixed"},
    "Sagittarius": {"start": "11-22", "end": "12-21", "element": "Fire", "quality": "Mutable"},
    "Capricorn": {"start": "12-22", "end": "01-19", "element": "Earth", "quality": "Cardinal"},
    "Aquarius": {"start": "01-20", "end": "02-18", "element": "Air", "quality": "Fixed"},
    "Pisces": {"start": "02-19", "end": "03-20", "element": "Water", "quality": "Mutable"}
}

# Helper functions
def get_constellation(longitude: float) -> str:
    """
    Convert ecliptic longitude to constellation name.
    
    Args:
        longitude (float): Ecliptic longitude in degrees
        
    Returns:
        str: Name of the constellation
    """
    constellations = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    index = int(longitude / 30) % 12  # Ensure index is within bounds
    return constellations[index]

def get_zodiac_sign(date: datetime) -> str:
    """
    Get zodiac sign for a given date.
    
    Args:
        date (datetime): Date to check
        
    Returns:
        str: Name of the zodiac sign
    """
    month_day = date.strftime("%m-%d")
    for sign, info in ZODIAC_SIGNS.items():
        if info["start"] <= month_day <= info["end"]:
            return sign
    return "Unknown"

def parse_date(date_str: Optional[str] = None) -> datetime:
    """
    Parse date string to datetime object.
    
    Args:
        date_str (Optional[str]): Date string in YYYY-MM-DD format
        
    Returns:
        datetime: Parsed datetime object
        
    Raises:
        HTTPException: If date format is invalid
    """
    if date_str:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    return datetime.now()

# API Endpoints
@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """
    Root endpoint that returns a welcome message.
    
    Returns:
        Dict[str, str]: A welcome message
    """
    return {"message": "Welcome to the Astrological API"}

@app.get("/planets", response_model=List[PlanetPosition], tags=["Planets"])
async def get_planet_positions(date: Optional[str] = None) -> List[PlanetPosition]:
    """
    Get positions of all planets for a given date.
    
    Args:
        date (Optional[str]): Date in YYYY-MM-DD format. If not provided, uses current date.
        
    Returns:
        List[PlanetPosition]: List of planet positions
        
    Raises:
        HTTPException: If date format is invalid
    """
    date_obj = parse_date(date)
    
    planets = [
        ephem.Sun(),
        ephem.Moon(),
        ephem.Mercury(),
        ephem.Venus(),
        ephem.Mars(),
        ephem.Jupiter(),
        ephem.Saturn(),
        ephem.Uranus(),
        ephem.Neptune(),
        ephem.Pluto()
    ]

    results = []
    for planet in planets:
        try:
            planet.compute(date_obj)
            results.append(PlanetPosition(
                name=planet.name,
                longitude=math.degrees(planet.hlon),
                latitude=math.degrees(planet.hlat),
                distance=planet.earth_distance,
                constellation=get_constellation(math.degrees(planet.hlon))
            ))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error calculating position for {planet.name}: {str(e)}"
            )

    return results

@app.get("/zodiac-signs", response_model=Dict[str, ZodiacSign], tags=["Zodiac"])
async def get_zodiac_signs() -> Dict[str, ZodiacSign]:
    """
    Get detailed information about all zodiac signs.
    
    Returns:
        Dict[str, ZodiacSign]: Dictionary containing information for each zodiac sign
    """
    return {
        sign: ZodiacSign(
            name=sign,
            start_date=info["start"],
            end_date=info["end"],
            element=info["element"],
            quality=info["quality"]
        )
        for sign, info in ZODIAC_SIGNS.items()
    }

@app.get("/zodiac-sign/{date}", tags=["Zodiac"])
async def get_zodiac_sign_for_date(date: str) -> Dict[str, str]:
    """
    Get zodiac sign information for a specific date.
    
    Args:
        date (str): Date in YYYY-MM-DD format
        
    Returns:
        Dict[str, str]: Information about the zodiac sign
        
    Raises:
        HTTPException: If date format is invalid or sign cannot be determined
    """
    date_obj = parse_date(date)
    sign = get_zodiac_sign(date_obj)
    
    if sign == "Unknown":
        raise HTTPException(
            status_code=404,
            detail="Could not determine zodiac sign"
        )
    
    return {
        "sign": sign,
        "element": ZODIAC_SIGNS[sign]["element"],
        "quality": ZODIAC_SIGNS[sign]["quality"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 