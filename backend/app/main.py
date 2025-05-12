from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import os
from dotenv import load_dotenv

load_dotenv()

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

# Astrology API configuration
ASTROLOGY_API_URL = "https://astrology-api.p.rapidapi.com/api/v2/planets"
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")

################################################################################
#                                   MODELS
################################################################################

class PlanetPosition(BaseModel):
    """Model representing a planet's position."""
    name: str = Field(..., description="Name of the planet")
    sign: str = Field(..., description="Current zodiac sign")
    element: str = Field(..., description="Element of the sign")
    quality: str = Field(..., description="Quality of the sign")

################################################################################
#                                   HELPERS
################################################################################

def get_planet_data() -> dict:
    """Helper function to get data from Astrology API"""
    try:
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "astrology-api.p.rapidapi.com"
        }
        
        response = requests.get(
            ASTROLOGY_API_URL,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to get data: {response.text}")
            
        return response.json()
    except Exception as e:
        raise Exception(f"Error accessing Astrology API: {str(e)}")

def get_element_for_sign(sign: str) -> str:
    """Helper function to get element for a zodiac sign"""
    elements = {
        "aries": "Fire",
        "leo": "Fire",
        "sagittarius": "Fire",
        "taurus": "Earth",
        "virgo": "Earth",
        "capricorn": "Earth",
        "gemini": "Air",
        "libra": "Air",
        "aquarius": "Air",
        "cancer": "Water",
        "scorpio": "Water",
        "pisces": "Water"
    }
    return elements.get(sign.lower(), "Unknown")

def get_quality_for_sign(sign: str) -> str:
    """Helper function to get quality for a zodiac sign"""
    qualities = {
        "aries": "Cardinal",
        "cancer": "Cardinal",
        "libra": "Cardinal",
        "capricorn": "Cardinal",
        "taurus": "Fixed",
        "leo": "Fixed",
        "scorpio": "Fixed",
        "aquarius": "Fixed",
        "gemini": "Mutable",
        "virgo": "Mutable",
        "sagittarius": "Mutable",
        "pisces": "Mutable"
    }
    return qualities.get(sign.lower(), "Unknown")

################################################################################
#                                   ENDPOINTS
################################################################################

@app.get("/planets", response_model=List[PlanetPosition], tags=["Planets"])
async def get_planet_positions() -> List[PlanetPosition]:
    """
    Get current positions of planets using the Astrology API.
    Returns a list of planet positions with their current zodiac signs.
    """
    try:
        data = get_planet_data()
        results = []
        
        for planet in data.get("planets", []):
            sign = planet.get("sign", "").lower()
            results.append(
                PlanetPosition(
                    name=planet.get("name", "Unknown"),
                    sign=sign.capitalize(),
                    element=get_element_for_sign(sign),
                    quality=get_quality_for_sign(sign)
                )
            )
            
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting planet data: {str(e)}"
        )
