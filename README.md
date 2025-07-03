## lilit.ai frontend

<br>

### running locally

<br>

install dependencies:

```bash
make install
```

<br>

add enviroment variables to `.env.local`:

```bash
cp .env.example .env.local
vim .env.local
```

<br>

build and start local server:

```bash
make server
```

<br>

or

```bash
make prod
```

<br>

### allowed domains

<br>

the following domains are allowed in the content security policy, and should be addded to `next.config.js`:

```
- api.coingecko.com
- nominatim.openstreetmap.org
- stream.binance.com
- lilit-service-astro.vercel.app
```
