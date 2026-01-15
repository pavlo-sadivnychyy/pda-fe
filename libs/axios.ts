import axios from "axios";
import { getClerkToken } from "@/libs/clerkToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    // ✅ додай Clerk JWT у заголовок
    const token = await getClerkToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("dev");
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

    if (status === 401) {
      console.warn("Unauthorized → redirect to login");
      window.location.href = "/sign-in";
      return;
    }

    if (status === 403) {
      alert("У вас немає доступу");
    }

    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  },
);
