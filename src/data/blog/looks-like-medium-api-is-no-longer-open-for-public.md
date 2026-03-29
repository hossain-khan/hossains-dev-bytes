---
title: Looks like Medium API is no longer open for public.
description: "Previously issued “Self-issued access tokens” no longer work. I am getting following for /v1/me API calls:"
pubDatetime: 2019-03-24T03:55:20.509Z
tags: []
featured: false
draft: false
---


Looks like Medium API is no longer open for public. The link [https://medium.com/me/applications](https://medium.com/me/applications) no longer work.

Previously issued “Self-issued access tokens” no longer work. I am getting following for `/v1/me` API calls:

```
<-- 401  https://api.medium.com/v1/me (300ms)  
content-type: application/json; charset=utf-8  
content-length: 60  
{"errors":\[{"message":"Application not found","code":6005}\]}
```

If this is the case, the Github repo ([https://github.com/Medium/medium-api-docs](https://github.com/Medium/medium-api-docs)) should be updated with the announcement updated supported API features.
