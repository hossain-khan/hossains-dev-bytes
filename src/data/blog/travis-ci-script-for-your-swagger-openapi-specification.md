---
title: Travis CI script for your Swagger/OpenAPI Specification
description: Recently I have been working with swagger in a project. Swagger 2.0 has become an open standard and now referred to as OpenAPI Specification…
pubDatetime: 2016-08-21T14:39:59.214Z
tags: ["ci", "swagger", "openapi"]
featured: false
draft: false
---


Recently I have been working with swagger in a project. [Swagger 2.0](http://swagger.io/) has become an open standard and now referred to as [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification) *(OAS)*.

I also love **medium.com**, so when I saw their API doc was hand written in plain text, I thought it would be good exercise to convert it to OpenAPI Specification format. The result is [https://github.com/amardeshbd/medium-api-specification](https://github.com/amardeshbd/medium-api-specification)

Now, recently I’ve started adding [**Travis**](https://travis-ci.org/) Continuous Integration (CI) script for most of my recent projects. So, I wanted to add CI support for this OAS project.

> **UPDATE: I have written another article that leverages GitHub actions and node modules to validate different things. Use this article to validate anything including Swagger/OpenAPI specifications.**

[**Use node.js tools on GitHub actions CI workflow** — *On April 14th, 2020 GitHub announced a major change in their plans to allow free private repositories. It’s a good time…*](https://medium.com/@hossainkhan/use-node-js-tools-on-github-actions-ci-workflow-120fb3b4a3e1)

### Adding Travis CI build support for OpenAPI specification

Googling for this specific topic didn’t bring much content. I wanted to keep the script simple and use existing validator provided by [swagger-validator-badge](https://github.com/swagger-api/validator-badge) web service *(NOTE: There are dozens of validators in different languages built by the community — see* [*http://swagger.io/open-source-integrations/*](http://swagger.io/open-source-integrations/)*)*.

Here are the key elements used for CI:

\* shUnit2 — for writing unit tests in shell script. This is downloaded via Travis build config *before* the build begins.

.travis.yml — Travis CI build config

\* validator-badge — online web-service to validate OpenAPI specification file

api-spec\_validation\_test.sh — Shell script for unit test

I hope somebody finds this useful for their project.
