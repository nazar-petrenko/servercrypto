// server.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const cache = new Map();
const pendingRequests = new Map();

// Функції кешу
const setCache = (key, data, ttl) => {
  cache.set(key, { data, expiry: Date.now() + ttl });
};

const getCache = (key) => {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Універсальна функція для запиту з кешем і захистом від дублювання
const fetchWithCache = async (key, url, params = {}, ttl = 5 * 60 * 1000) => {
  const cached = getCache(key);
  if (cached) return cached;

  // Якщо вже є запит у процесі — чекаємо його
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = axios.get(url, { params })
    .then((res) => {
      setCache(key, res.data, ttl);
      pendingRequests.delete(key);
      return res.data;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, request);
  return request;
};

// --- ROUTES ---
app.get("/api/coin/:id", async (req, res) => {
  try {
    const data = await fetchWithCache(
      `coin-${req.params.id}`,
      `https://api.coingecko.com/api/v3/coins/${req.params.id}`,
      {},
      10 * 60 * 1000 // TTL = 10 хв
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching coin details:", err.message);
    res.status(500).json({ error: "Failed to fetch coin data" });
  }
});

app.get("/api/coin/:id/market_chart", async (req, res) => {
  const { vs_currency = "usd", days = 7 } = req.query;
  try {
    const data = await fetchWithCache(
      `chart-${req.params.id}-${vs_currency}-${days}`,
      `https://api.coingecko.com/api/v3/coins/${req.params.id}/market_chart`,
      { vs_currency, days },
      5 * 60 * 1000 // TTL = 5 хв
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

app.get("/api/coins/markets", async (req, res) => {
  const { vs_currency = "usd", order = "market_cap_desc", per_page = 100, page = 1, sparkline = false } = req.query;
  try {
    const data = await fetchWithCache(
      `markets-${vs_currency}-${order}-${per_page}-${page}-${sparkline}`,
      "https://api.coingecko.com/api/v3/coins/markets",
      { vs_currency, order, per_page, page, sparkline },
      2 * 60 * 1000 // TTL = 2 хв
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch market coins" });
  }
});

app.listen(5000, () => console.log("Proxy running on http://localhost:5000"));
