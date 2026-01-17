## future.ai frontend

<br>

<p align="center">
<img src="docs/future1.png" width="90%" align="center"/>
</p>

<br>

---

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
- nominatim.openstreetmap.org
- future-service-astro.vercel.app
```
