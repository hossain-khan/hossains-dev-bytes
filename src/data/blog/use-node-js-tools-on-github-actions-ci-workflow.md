---
title: Use node.js tools on GitHub actions CI workflow
description: On April 14th, 2020 GitHub announced a major change in their plans to allow free private repositories. It’s a good time to make use of…
pubDatetime: 2020-05-23T13:21:51.565Z
tags: ["node.js", "github-actions", "ci"]
featured: false
draft: false
---


![](https://cdn-images-1.medium.com/max/2560/1*m18ctS27-VjFo_ghFRQ2ug.jpeg)

GitHub Actions Continuous Integration (CI) Workflow

---

On April 14th, 2020 GitHub [announced](https://github.blog/2020-04-14-github-is-now-free-for-teams/) a major change in their plans to allow free private repositories. It’s a good time to make use of their free CI/CD known as “[Actions](https://github.com/features/actions)”. Private repositories have 2000mins/month and public repositories have unlimited minutes (*see* [*pricing*](https://github.com/pricing)).

This is a quick write-up on how you can leverage Actions CI Workflow to do any task using supported node.js modules from [npm](https://www.npmjs.com/).

> NOTE: If you are new to GitHub Actions, I highly recommend reading their ‘[Getting Started](https://help.github.com/en/actions/getting-started-with-github-actions)’ guide first.

The concept is simple, you set up a node environment on CI machine, install required CLI-based node modules, and run your tests.

> NOTE: Use node package manager portal at [npmjs.com](https://www.npmjs.com/) to find your node-module to run on GitHub Actions CI job.

Use case #1: Use XML Validator module to validate XML. See [workflow file](https://github.com/amardeshbd/android-hk-vision-muzei-plugin/blob/master/.github/workflows/android.yml).

```yaml
    - name: Setup NodeJS  
      uses: actions/setup-node@v1  
      with:  
        node-version: 12.x  
  
    - name: Install XML Validator  
      run: npm install -g fast-xml-parser  
    - name: Validate AndroidManifest.xml  
      run: xml2js -V app/src/main/AndroidManifest.xml
```

Use case #2: Validate JSON file using JSON-Schema specification ([source](https://github.com/amardeshbd/vision.hossainkhan.com/blob/master/.github/workflows/validate-json-nodejs.yml)).

```yaml
    - name: Setup NodeJS  
      uses: actions/setup-node@v1  
      with:  
        node-version: 12.x
```
```yaml
    - run: npm install -g ajv-cli  
    - run: ajv validate -s photos-schema.json -d photos.json
```

---

That’s it, now you have your own workflow to validate or do other tasks on GitHub repository.
