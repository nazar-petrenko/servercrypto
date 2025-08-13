# CryptoTracker Backend (Node.js + Express)

This is a lightweight backend server for the **CryptoTracker** app.  
It acts as a **proxy** between the frontend and the [CoinGecko API](https://www.coingecko.com/), adding:
- **Caching** to reduce API calls
- **Duplicate request prevention**
- **CORS support** for frontend requests

---

## Features
- Fetch cryptocurrency details (`/api/coin/:id`)
- Fetch market chart data (`/api/coin/:id/market_chart`)
- Fetch top market coins (`/api/coins/markets`)
- Automatic caching (configurable TTL for each request)
- Prevents multiple identical requests from hitting CoinGecko at the same time

---

## Installation

1. Clone this backend repository:
   ```bash
   git clone https://github.com/yourusername/cryptotracker-backend.git
   cd cryptotracker-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. The backend will be running at:
   ```
   http://localhost:5000
   ```

---

## API Endpoints

### 1. Get coin details
```
GET /api/coin/:id
```
Example:
```
/api/coin/bitcoin
```

### 2. Get coin market chart
```
GET /api/coin/:id/market_chart?vs_currency=usd&days=7
```

### 3. Get market coins list
```
GET /api/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1
```

---

## Notes
- This backend **must** be running for the frontend to work.
- It is designed to reduce API rate limit issues, but if you click too many times very fast, CoinGecko may still temporarily block requests. In future versions, additional rate-limiting and queue handling will be implemented.
