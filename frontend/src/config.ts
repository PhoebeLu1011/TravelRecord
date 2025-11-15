// src/config.ts
const DEV = import.meta.env.DEV;

export const API_BASE = DEV
  ? "http://localhost:5000" // 本地跑 Flask 的網址
  : "https://travelrecord-backend.onrender.com"; // Render 後端網址
