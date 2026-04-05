---
title: How to Deploy GitHub’s Spark App to Cloudflare Workers
description: GitHub’s Spark is a fantastic starting point for building modern React applications that uses spark-template as a starting point. Once you…
pubDatetime: 2025-09-28T13:52:59.880Z
tags: ["cloudflare", "github", "deployment"]
featured: true
draft: false
---

![](https://cdn-images-1.medium.com/max/800/1*0KIDO0mfjpv6_PTAN7uDYg.jpeg)

GitHub’s [Spark](https://github.com/features/spark) is a fantastic starting point for building modern React applications that uses [spark-template](https://github.com/github/spark-template) as a starting point. Once you have built the app, GitHub does allow you to publish the Spark site, however that requires users to have GitHub account to visit the site.

In this guide, we’ll walk through the process of adapting the spark-template to deploy seamlessly to Cloudflare Workers using the modern ASSETS binding approach.

> ℹ NOTE: Even though this guide is for GitHub Spark app, the same concept can be applied to any static node based apps ✌🏽

### Why Cloudflare Workers?

Cloudflare Workers offers several compelling advantages for deploying React SPAs:

- Global CDN: Your app is served from 330+ locations worldwide
- Zero-config static hosting: No server configuration needed
- SPA routing support: Client-side routes work seamlessly
- Cost-effective: Free tier includes 100,000 requests/day
- Instant cold starts: No server spin-up time
- Built-in security: Automatic HTTPS, DDoS protection, and rate limiting

### Prerequisites

Before we begin, make sure you have:

1.  Cloudflare Account: Sign up at [cloudflare.com](http://cloudflare.com/)
2.  Spark App: The Spark app must be published to your GitHub repository.

### Step-by-Step Implementation

For this example, I have created a Spark app called JSON to CSV Converter. I will use that as an example of how to configure it. Update the key information of the project where applicable.

#### Prepare Project for Cloudflare Workers

**Create the Cloudflare Worker Script**

Create a new file `src/_worker.js` with the following content:

```javascript
/**
 * Cloudflare Worker for Spark Template App
 * Simple ASSETS binding approach for static site hosting
 */
export default {
  async fetch(request, env, ctx) {
    // Serve static assets using the ASSETS binding
    return env.ASSETS.fetch(request);
  },
};
```

This minimal worker leverages Cloudflare’s ASSETS binding to serve your static files without any custom logic.

**Create Assets Ignore File**

Create `src/.assetsignore` to exclude the worker script from being served as a static asset:

```text
_worker.js
```

**Create worker config**

Create a `wrangler.toml` file in your project root:

```toml
name = "my-spark-app"
main = "dist/_worker.js"
compatibility_date = "2025-08-29"
workers_dev = true

[assets]
directory = "./dist"
binding = "ASSETS"
html_handling = "auto-trailing-slash"
not_found_handling = "single-page-application"

[build]
command = "npm run build"
```

Key configuration options:

- `not_found_handling = "single-page-application"`: Enables client-side routing
- `html_handling = "auto-trailing-slash"`: Handles clean URLs
- `directory = "./dist"`: Points to your build output
- `name = "my-spark-app"`: This will be the app ID you use when creating a worker in Cloudflare

**Update package.json Scripts**

Add the deployment script to your `package.json`: Add ‘copy-worker’ step and update ‘build’ step.

```json
{
  "scripts": {
    # other existing configs ...
    "copy-worker": "cp src/_worker.js dist/_worker.js && cp src/.assetsignore dist/.assetsignore",
    "build": "tsc -b --noCheck && vite build && npm run copy-worker",
  }
}
```

The key addition is `"copy-worker"` step that copies necessary files to `dist/` directory. Then, the step is used in the `"build"` step.

**Update Vite Configuration (if needed)**

If you encounter a build issue in Cloudflare, update the following line from:

```javascript
const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;
```

to

```javascript
const projectRoot = process.env.PROJECT_ROOT || process.cwd();
```

### File Structure After Implementation

Your project structure should look like this:

```text
spark-template/
├── src/
│   ├── _worker.js          # Cloudflare Worker script
│   ├── .assetsignore       # Excludes worker from static assets
│   └── [your app files]    # React components and assets
├── dist/ (after build)
│   ├── _worker.js          # Copied worker script
│   ├── .assetsignore       # Copied asset exclusions
│   ├── index.html          # Built app entry point
│   └── assets/             # Built app assets
├── wrangler.toml           # Cloudflare Workers configuration
├── vite.config.ts          # Updated with minor fix
└── package.json            # Updated with 'copy-worker' and 'build' script
```

### Cloudflare Workers Deployment

Once you’ve made all the changes, creating Cloudflare Workers is easy. First, ensure your GitHub account is connected so that when importing the project you can see your repository.

### Importing Repository

First go to workers section and click on “Create application”

![](https://cdn-images-1.medium.com/max/800/1*QXeQvIdfjUkUldqr9KKXMQ.png)

‘Workers & Pages’ settings in Cloudflare Dashboard

You should be presented with following screen, where you should select “Import a repository”

![](https://cdn-images-1.medium.com/max/800/1*SvJ4m7cX-ImguhRy1A5EzQ.png)

Since your GitHub is connected, it should be able to show the Spark project in the dropdown list. Pick the Spark project and continue.

![](https://cdn-images-1.medium.com/max/800/1*v79Pvdv_G-dWDxe-Csh4gQ.png)

On the “Set up your application” leave the default except the “Project name” that should match what you used in the `wrangler.toml` file above.

![](https://cdn-images-1.medium.com/max/800/1*6m_JzbF6JzkSIHeg1xMwrg.png)

Once you click on “Create and deploy” it should checkout the code and start deploying to Cloudflare network.

![](https://cdn-images-1.medium.com/max/800/1*6f2Szp4g5Nd77DymnTYdcg.png)

Take a look into build log, it ideally should succeed if everything went well. If it hasn’t, you can still continue to project screen and click on “Deployments” tab to get back to build log and fix any outstanding issue.

![](https://cdn-images-1.medium.com/max/800/1*i4YbpnpAvihJZJG2s4AH_g.png)

Once build is complete successfully, clicking on the external link button on the top should take you to the site. Or you can go to “Settings” tab and get the domain from “Domains & Routes” section.

![](https://cdn-images-1.medium.com/max/800/1*r__1VjZX6ctzrs0be2jMjA.png)

✓ That's it, you got your Spark app up and running on Cloudflare’s edge network. If you have domain hosted with Cloudflare you can also use that as custom domain or sub-domain for the app.

---

### Troubleshooting

#### Build Issues

Sometimes build issues related to `package-lock.json` may happen, in that case re-build app and push changes.

```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```
