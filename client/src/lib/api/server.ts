import "server-only";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function apiServerGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  
  // Get all cookies and send them all (backend will pick the right one)
  const allCookies = cookieStore.toString();

  console.log("API Server Get - Path:", path);
  console.log("API Server Get - All cookies:", allCookies.substring(0, 200));

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { 
      cookie: allCookies,
      'content-type': 'application/json'
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.log("API Server Get - Response status:", res.status);
    console.log("API Server Get - Response headers:", Object.fromEntries(res.headers.entries()));
    
    // If the response is not JSON, throw an error with the status
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    
    // If it's JSON, try to parse the error
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || `API Error: ${res.status}`);
    } catch {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
  }

  return res.json();
}

export async function apiServerPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const cookieStore = await cookies();
  
  // Get all cookies and send them all (backend will pick the right one)
  const allCookies = cookieStore.toString();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: allCookies,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || `API Error: ${res.status}`);
    } catch {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
  }

  return res.json();
}
