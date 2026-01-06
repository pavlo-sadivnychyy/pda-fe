import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // важливо для cookies session
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    // For debug
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${config.method?.toUpperCase()} → ${config.url}`,
        config.data || "",
      );
    }

    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;

    // console.log("API ERROR:", status, error?.response?.data);

    // 🔐 Якщо бекенд каже "не авторизований"
    if (status === 401) {
      console.warn("Unauthorized → redirect to login");
      window.location.href = "/sign-in";
      return;
    }

    // 🚫 Заборонено (немає прав)
    if (status === 403) {
      alert("У вас немає доступу");
    }

    // 🧨 Сервер впав
    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  },
);
