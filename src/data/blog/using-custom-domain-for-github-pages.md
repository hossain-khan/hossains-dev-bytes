---
title: Using custom domain for GitHub pages
description: Recently I decided to host my personal portfolio site using GitHub pages. Even though they have very detailed instruction on how to setup a…
pubDatetime: 2018-01-19T03:02:23.969Z
tags: ["github", "github-pages", "web"]
featured: false
draft: false
---


Recently I decided to host my personal portfolio site using [GitHub pages](https://pages.github.com/). Even though they have very detailed [instruction](https://help.github.com/articles/using-a-custom-domain-with-github-pages/) on how to set up a custom domain, I found it cumbersome to get to the right information. 🙄

Here are **2** key steps to set up your GitHub pages [enabled](https://guides.github.com/features/pages/) project to use your **custom domain**.

---

#### ⚙️Step 1 — Set domain in GitHub project

---

![](https://cdn-images-1.medium.com/max/1200/1*bMCYC7Q-FXhMiW9HC3676g.png)

Go to your GitHub Pages site’s repository settings. Under “Custom domain”, add or remove your custom domain and click “Save”.

---

Setting “custom domain” creates a file named `**CNAME**` in the same repository. Don’t delete it.

#### ⚙️Step 2 — Set custom resource record for domain

This step is specific to your domain name registrar (like GoDaddy, Domain.com, Google Domains, etc). All you need to do is set `**A**` & `**CNAME**` records for the selected domain.

---

![](https://cdn-images-1.medium.com/max/1200/1*lT1CCfb9jX74vGrsF5AoLA.png)

This is a sample screenshot taken from the **Google Domains** portal.

---

For `**A**` record, set `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. To redirect `**www**` subdomain to the original domain, add a `**CNAME**` record with your GitHub pages profile URL with a `.`(dot) in the end, for example, ‘`*YOUR-GITHUB-USERNAME.github.io.*`’.

***Official References****: For most up to date IP Addresses, use GitHub’s* [*official documentation*](https://help.github.com/articles/setting-up-an-apex-domain/) *and for setting up CNAME use this* [*documentation*](https://help.github.com/articles/setting-up-a-www-subdomain/)*.*

---

That’s it, both `www.your-domain.com` and `your-domain.com` will now go to your selected GitHub pages site *(may need to wait up to 24 hours)*. If you want to see a live example, you may visit my portfolio “[hossainkhan.com](http://hossainkhan.com/)” hosted via GitHub [pages](https://github.com/amardeshbd/hossainkhan.com) repository ✌️.

> UPDATE #1: The IP addresses for DNS `A` record is updated. The new IP addresses are required to use the free HTTPS support for GitHub pages.

> UPDATE #2: Some people said this change is not working, it is actually because the DNS update can **take up to** **24 hours** to propagate. So, I guess try hitting your domain next day 🤓

> NOTE #1: Even though it’s very obvious, you should replace `*YOUR-GITHUB-USERNAME*` and `your-domain.com` with your personal GitHub username and domain name you are trying to use respectively.
