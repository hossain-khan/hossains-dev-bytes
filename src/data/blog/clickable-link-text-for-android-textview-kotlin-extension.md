---
title: Clickable link text for Android TextView — Kotlin Extension
description: Recently I have had to create UI that required user tappable/clickable text in the same text view. I know this is kind of unusual as the…
pubDatetime: 2020-01-02T00:53:57.928Z
tags: []
featured: false
draft: false
---


Recently I have had to create UI that required user tappable/clickable text in the same text view. I know this is kind of unusual as the touch target for the view will likely be smaller compared to a button with no outline style. However, I wanted to share a quick Kotlin extension function that is dynamic and well tested.

![](https://cdn-images-1.medium.com/max/800/1*_xZdmLNOUR7vrQ-jQYomxA.png)

Android TextView where “Register Now” is a tappable link with a callback.

Here is an example usage for generating clickable link within the same `TextView`

So, if your project requires something like this take a look at the following extension function for `android.widget.TextView`.

You should be able to easily convert this to Java if needed. Let me know if you find this useful. Cheers ✌️
