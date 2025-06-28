import axios from "axios";

const api = axios.create({
  baseURL:
    "https://backend-rg-server-cjb7grcvatgnbcg0.canadacentral-01.azurewebsites.net/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
