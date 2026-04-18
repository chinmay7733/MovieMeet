import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://127.0.0.1:5000/api");

const API = axios.create({
  baseURL: apiBaseUrl,
});

API.interceptors.request.use(req => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        `Backend server reachable nahi hai at ${apiBaseUrl}. ` +
        "Backend start karke phir try karo.";
    }

    return Promise.reject(error);
  }
);

export default API;
