## astrological API

<br>


> *a FastAPI-based API that provides astrological information including planet positions and zodiac sign details.*

<br>

---

### setup

<br>

1. create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

<br>

2. install dependencies:
```bash
make install
```

<br>

3. run the server (available at [localhost:8000](http://localhost:8000)):

```bash
make server
```

<br>

---

### endpoints

<br>

- `GET /planets`: get positions of all planets

- `GET /zodiac-signs`: get information about zodiac signs

- `GET /zodiac-sign/{date}`: get zodiac sign for a specific date(format: YYYY-MM-DD)

- `GET /docs`: calculate planet positions in constellations
