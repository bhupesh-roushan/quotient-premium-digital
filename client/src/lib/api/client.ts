import axios from "axios";

/**
 * Pre-configured Axios instance used for all client-side API calls.
 * Uses relative URLs so requests go through Next.js rewrites to the backend.
 * withCredentials is enabled so cookies are sent on every request automatically.
 */
export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
});
