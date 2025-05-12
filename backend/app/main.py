from datetime import datetime
from typing import Dict, List, Optional
import ephem
import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


################################################################################
#                                   API CONFIG
################################################################################

API_CONFIG = {
    "title": "Lilit's Astrological API",
    "version": "0.0.1",
    "docs_url": "/docs",
}
app = FastAPI(**API_CONFIG)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


################################################################################
#                                   CONSTANTS
################################################################################

ZODIAC_SIGNS = {
    "Aries": {
        "start": "03-21",
        "end": "04-19",
        "element": "Fire",
        "quality": "Cardinal",
    },
    "Taurus": {
        "start": "04-20",
        "end": "05-20",
        "element": "Earth",
        "quality": "Fixed",
    },
    "Gemini": {
        "start": "05-21",
        "end": "06-20",
        "element": "Air",
        "quality": "Mutable",
    },
    "Cancer": {
        "start": "06-21",
        "end": "07-22",
        "element": "Water",
        "quality": "Cardinal",
    },
    "Leo": {"start": "07-23", "end": "08-22", "element": "Fire", "quality": "Fixed"},
    "Virgo": {
        "start": "08-23",
        "end": "09-22",
        "element": "Earth",
        "quality": "Mutable",
    },
    "Libra": {
        "start": "09-23",
        "end": "10-22",
        "element": "Air",
        "quality": "Cardinal",
    },
    "Scorpio": {
        "start": "10-23",
        "end": "11-21",
        "element": "Water",
        "quality": "Fixed",
    },
    "Sagittarius": {
        "start": "11-22",
        "end": "12-21",
        "element": "Fire",
        "quality": "Mutable",
    },
    "Capricorn": {
        "start": "12-22",
        "end": "01-19",
        "element": "Earth",
        "quality": "Cardinal",
    },
    "Aquarius": {
        "start": "01-20",
        "end": "02-18",
        "element": "Air",
        "quality": "Fixed",
    },
    "Pisces": {
        "start": "02-19",
        "end": "03-20",
        "element": "Water",
        "quality": "Mutable",
    },
}


################################################################################
#                                   MODELS
################################################################################


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
    element: str = Field(
        ..., description="Associated element (Fire, Earth, Air, Water)"
    )
    quality: str = Field(..., description="Sign quality (Cardinal, Fixed, Mutable)")


################################################################################
#                                   HELPERS
################################################################################


def get_constellation(longitude: float) -> str:
    constellations = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    ]
    index = int(longitude / 30) % 12  # Ensure index is within bounds
    return constellations[index]


def get_zodiac_sign(date: datetime) -> str:
    month_day = date.strftime("%m-%d")
    for sign, info in ZODIAC_SIGNS.items():
        if info["start"] <= month_day <= info["end"]:
            return sign
    return "Unknown"


def parse_date(date_str: Optional[str] = None) -> datetime:
    if date_str:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid date format. Use YYYY-MM-DD"
            )
    return datetime.now()


################################################################################
#                                   ENDPOINTS
################################################################################


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    return {"message": "Welcome to the Astrological API"}


@app.get("/planets", response_model=List[PlanetPosition], tags=["Planets"])
async def get_planet_positions(date: Optional[str] = None) -> List[PlanetPosition]:
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
        ephem.Pluto(),
    ]

    results = []
    for planet in planets:
        try:
            planet.compute(date_obj)
            results.append(
                PlanetPosition(
                    name=planet.name,
                    longitude=math.degrees(planet.hlon),
                    latitude=math.degrees(planet.hlat),
                    distance=planet.earth_distance,
                    constellation=get_constellation(math.degrees(planet.hlon)),
                )
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error calculating position for {planet.name}: {str(e)}",
            )

    return results


@app.get("/zodiac-signs", response_model=Dict[str, ZodiacSign], tags=["Zodiac"])
async def get_zodiac_signs() -> Dict[str, ZodiacSign]:
    return {
        sign: ZodiacSign(
            name=sign,
            start_date=info["start"],
            end_date=info["end"],
            element=info["element"],
            quality=info["quality"],
        )
        for sign, info in ZODIAC_SIGNS.items()
    }


@app.get("/zodiac-sign/{date}", tags=["Zodiac"])
async def get_zodiac_sign_for_date(date: str) -> Dict[str, str]:
    date_obj = parse_date(date)
    sign = get_zodiac_sign(date_obj)

    if sign == "Unknown":
        raise HTTPException(status_code=404, detail="Could not determine zodiac sign")

    return {
        "sign": sign,
        "element": ZODIAC_SIGNS[sign]["element"],
        "quality": ZODIAC_SIGNS[sign]["quality"],
    }
