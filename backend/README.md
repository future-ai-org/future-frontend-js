## astrological API

A FastAPI-based API that provides astrological information including planet positions and zodiac sign details.

## Features

- Get positions of all planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- Get information about zodiac signs
- Get zodiac sign for a specific date
- Calculate planet positions in constellations

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
cd app
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /`: Welcome message
- `GET /planets`: Get positions of all planets (optional query parameter: date in YYYY-MM-DD format)
- `GET /zodiac-signs`: Get information about all zodiac signs
- `GET /zodiac-sign/{date}`: Get zodiac sign for a specific date (format: YYYY-MM-DD)

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc` 