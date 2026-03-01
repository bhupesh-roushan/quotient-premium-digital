import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Pre-configured Axios instance used for all client-side API calls.
 * Base URL is set from NEXT_PUBLIC_API_BASE_URL and withCredentials is
 * enabled so the auth cookie is sent on every request automatically.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
