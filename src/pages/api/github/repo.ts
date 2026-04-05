/**
 * GitHub Repository API Proxy
 * 
 * Secure proxy for GitHub API requests using GITHUB_TOKEN secret.
 * Caches responses for 24 hours to reduce API calls.
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

export const GET: APIRoute = async ({ url, locals }) => {
  const repo = url.searchParams.get("repo");

  // Validate repo parameter
  if (!repo || !repo.includes("/")) {
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
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
    });

    if (!repoResponse.ok) {
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

    const repoData: GitHubRepo = await repoResponse.json();

    // Fetch languages
    let languages: string[] = [];
    try {
      const langResponse = await fetch(
        `https://api.github.com/repos/${repo}/languages`,
        { headers }
      );

      if (langResponse.ok) {
        const langData: GitHubLanguages = await langResponse.json();
        // Sort by byte count (descending) and get top 2
        languages = Object.entries(langData)
          .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
          .slice(0, 2)
          .map(([lang]) => lang);
      }
    } catch (e) {
      // Languages fetch is optional, continue with repo data
      console.warn(
        `[GitHub API Proxy] Failed to fetch languages for ${repo}:`,
        e
      );
    }

    const responseData: ApiResponse = {
      repo: repoData,
      languages,
      error: null,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (e) {
    console.error("[GitHub API Proxy] Error:", e);
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
