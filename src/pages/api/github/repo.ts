/**
 * GitHub Repository API Proxy
 * 
 * Secure proxy for GitHub API requests using GITHUB_TOKEN secret.
 * Caches responses for 24 hours to reduce API calls.
 * 
 * Logs all requests with metrics:
 * - Cache hit/miss status
 * - API response times
 * - Language fetch performance
 * - Error tracking
 * 
 * Usage:
 *   /api/github/repo?repo=username/repo-name
 */

import type { APIRoute } from "astro";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface GitHubLanguages {
  [key: string]: number;
}

interface ApiResponse {
  repo: GitHubRepo | null;
  languages: string[];
  error: string | null;
}

/**
 * Structured logging for GitHub API Proxy
 */
interface LogEntry {
  timestamp: string;
  repo: string;
  type: "request" | "cache_hit" | "api_call" | "languages_fetch" | "error" | "success";
  duration?: number; // milliseconds
  status?: number;
  cached?: boolean;
  message?: string;
}

function log(entry: LogEntry) {
  console.log(JSON.stringify(entry));
}

export const GET: APIRoute = async ({ url, locals }) => {
  const repo = url.searchParams.get("repo");
  const requestStart = Date.now();

  // Validate repo parameter
  if (!repo || !repo.includes("/")) {
    log({
      timestamp: new Date().toISOString(),
      repo: repo || "unknown",
      type: "error",
      message: "Invalid repo format",
      duration: Date.now() - requestStart,
    });

    return new Response(
      JSON.stringify({
        error: 'Invalid repo format. Use "username/repo-name"',
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  log({
    timestamp: new Date().toISOString(),
    repo,
    type: "request",
    message: "GitHub API request received",
  });

  try {
    // Access GITHUB_TOKEN from Cloudflare runtime environment
    // @ts-ignore - accessing runtime env from Cloudflare binding
    const token = locals.runtime.env.GITHUB_TOKEN;

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    // Use authenticated requests if token available (5000/hour vs 60/hour)
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    // Fetch repository data
    const repoFetchStart = Date.now();
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
    });
    const repoFetchDuration = Date.now() - repoFetchStart;

    if (!repoResponse.ok) {
      log({
        timestamp: new Date().toISOString(),
        repo,
        type: "error",
        status: repoResponse.status,
        message: `Repository fetch failed`,
        duration: repoFetchDuration,
      });

      return new Response(
        JSON.stringify({
          error: `Repository not found (${repoResponse.status})`,
        }),
        {
          status: repoResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    log({
      timestamp: new Date().toISOString(),
      repo,
      type: "api_call",
      status: repoResponse.status,
      duration: repoFetchDuration,
      message: "Repository data fetched successfully",
    });

    const repoData: GitHubRepo = await repoResponse.json();

    // Fetch languages
    let languages: string[] = [];
    try {
      const langFetchStart = Date.now();
      const langResponse = await fetch(
        `https://api.github.com/repos/${repo}/languages`,
        { headers }
      );
      const langFetchDuration = Date.now() - langFetchStart;

      if (langResponse.ok) {
        const langData: GitHubLanguages = await langResponse.json();
        // Sort by byte count (descending) and get top 2
        languages = Object.entries(langData)
          .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
          .slice(0, 2)
          .map(([lang]) => lang);

        log({
          timestamp: new Date().toISOString(),
          repo,
          type: "languages_fetch",
          status: langResponse.status,
          duration: langFetchDuration,
          message: `Fetched ${languages.length} languages`,
        });
      } else {
        log({
          timestamp: new Date().toISOString(),
          repo,
          type: "languages_fetch",
          status: langResponse.status,
          duration: langFetchDuration,
          message: `Language fetch failed with status ${langResponse.status}`,
        });
      }
    } catch (e) {
      // Languages fetch is optional, continue with repo data
      log({
        timestamp: new Date().toISOString(),
        repo,
        type: "languages_fetch",
        message: `Language fetch error: ${String(e)}`,
      });
    }

    const responseData: ApiResponse = {
      repo: repoData,
      languages,
      error: null,
    };

    const totalDuration = Date.now() - requestStart;

    log({
      timestamp: new Date().toISOString(),
      repo,
      type: "success",
      duration: totalDuration,
      message: `Request completed successfully (${languages.length} languages found)`,
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (e) {
    const totalDuration = Date.now() - requestStart;

    log({
      timestamp: new Date().toISOString(),
      repo,
      type: "error",
      duration: totalDuration,
      message: `Unexpected error: ${String(e)}`,
    });

    return new Response(
      JSON.stringify({
        error: `Failed to fetch repository: ${String(e)}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
