from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import ephem
from typing import Dict, List
import math

app = FastAPI(
    title="Astrological API",
    description="""
    A comprehensive API for astrological calculations and information.
    
    ## Features
    * Calculate planetary positions
    * Get zodiac sign information
    * Determine zodiac signs for specific dates
    
    ## Usage
    All dates should be provided in YYYY-MM-DD format.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

class PlanetPosition(BaseModel):
    name: str
    longitude: float
    latitude: float
    distance: float
    constellation: str

class ZodiacSign(BaseModel):
    name: str
    start_date: str
    end_date: str
    element: str
    quality: str

# Zodiac signs information
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

def get_constellation(longitude: float) -> str:
    """Convert ecliptic longitude to constellation name."""
    constellations = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    index = int(longitude / 30)
    return constellations[index]

def get_zodiac_sign(date: datetime) -> str:
    """Get zodiac sign for a given date."""
    month_day = date.strftime("%m-%d")
    for sign, info in ZODIAC_SIGNS.items():
        if info["start"] <= month_day <= info["end"]:
            return sign
    return "Unknown"

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint that returns a welcome message.
    
    Returns:
        dict: A welcome message
    """
    return {"message": "Welcome to the Astrological API"}

@app.get("/planets", response_model=List[PlanetPosition], tags=["Planets"])
async def get_planet_positions(date: str = None):
    """
    Get positions of all planets for a given date.
    
    Args:
        date (str, optional): Date in YYYY-MM-DD format. If not provided, uses current date.
        
    Returns:
        List[PlanetPosition]: List of planet positions including:
            - name: Planet name
            - longitude: Ecliptic longitude in degrees
            - latitude: Ecliptic latitude in degrees
            - distance: Distance from Earth in AU
            - constellation: Current zodiac constellation
            
    Raises:
        HTTPException: If date format is invalid
    """
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        date_obj = datetime.now()

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
        planet.compute(date_obj)
        results.append(PlanetPosition(
            name=planet.name,
            longitude=math.degrees(planet.hlon),
            latitude=math.degrees(planet.hlat),
            distance=planet.earth_distance,
            constellation=get_constellation(math.degrees(planet.hlon))
        ))

    return results

@app.get("/zodiac-signs", response_model=Dict[str, ZodiacSign], tags=["Zodiac"])
async def get_zodiac_signs():
    """
    Get detailed information about all zodiac signs.
    
    Returns:
        Dict[str, ZodiacSign]: Dictionary containing information for each zodiac sign:
            - name: Sign name
            - start_date: Start date (MM-DD)
            - end_date: End date (MM-DD)
            - element: Associated element (Fire, Earth, Air, Water)
            - quality: Sign quality (Cardinal, Fixed, Mutable)
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
async def get_zodiac_sign_for_date(date: str):
    """
    Get zodiac sign information for a specific date.
    
    Args:
        date (str): Date in YYYY-MM-DD format
        
    Returns:
        dict: Information about the zodiac sign for the given date:
            - sign: Zodiac sign name
            - element: Associated element
            - quality: Sign quality
            
    Raises:
        HTTPException: If date format is invalid or sign cannot be determined
    """
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    sign = get_zodiac_sign(date_obj)
    if sign == "Unknown":
        raise HTTPException(status_code=404, detail="Could not determine zodiac sign")
    
    return {
        "sign": sign,
        "element": ZODIAC_SIGNS[sign]["element"],
        "quality": ZODIAC_SIGNS[sign]["quality"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 