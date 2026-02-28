import { Router } from "express";
import { z } from "zod";

export const serpApiRouter = Router();

// Google Images Search using SerpApi
serpApiRouter.post("/images", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        ok: false,
        error: "Search query is required",
      });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "SerpApi API key not configured",
      });
    }

    // Construct SerpApi URL for Google Images search
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.append('engine', 'google_images');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('api_key', apiKey);
    searchUrl.searchParams.append('num', '20'); // Number of results
    
    // Optional: Add search parameters for better results
    searchUrl.searchParams.append('safe', 'active');
    searchUrl.searchParams.append('filter', '1');

    const response = await fetch(searchUrl.toString());
    const data = await response.json() as any;

    if (data.error) {
      return res.status(400).json({
        ok: false,
        error: data.error || "Failed to search images",
      });
    }

    // Extract relevant image information
    const images = (data.images_results || []).map((img: any) => ({
      original: img.original || img.link,
      thumbnail: img.thumbnail,
      title: img.title || '',
      source: img.source || img.link,
      width: img.width,
      height: img.height,
    }));

    res.json({
      ok: true,
      images,
      searchInformation: {
        searchTime: data.search_information?.search_time,
        totalResults: data.search_information?.total_results,
      }
    });
  } catch (error) {
    console.error("SerpApi search error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

// Google Web Search (optional, for future use)
serpApiRouter.post("/search", async (req, res) => {
  try {
    const { query, num = 10 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        ok: false,
        error: "Search query is required",
      });
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "SerpApi API key not configured",
      });
    }

    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.append('engine', 'google');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('api_key', apiKey);
    searchUrl.searchParams.append('num', num.toString());

    const response = await fetch(searchUrl.toString());
    const data = await response.json() as any;

    if (data.error) {
      return res.status(400).json({
        ok: false,
        error: data.error || "Failed to search",
      });
    }

    const results = (data.organic_results || []).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      displayed_link: result.displayed_link,
    }));

    res.json({
      ok: true,
      results,
      searchInformation: data.search_information,
    });
  } catch (error) {
    console.error("SerpApi web search error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});
