---
title: Dark mode for medium.com — why doesn’t it exist (yet)?
description: Medium has launched a sister site called MOMENTUM that is in dark mode. Here I talk about how you can possibly have dark-mode now.
pubDatetime: 2020-07-05T05:22:57.997Z
tags: ["medium", "ui", "ux"]
featured: false
draft: false
---


![](https://cdn-images-1.medium.com/max/2560/1*46QX5-femxRZbClmZzMtRQ.png)

My personal visualization of Dark-Mode for medium.com

---

I have a love and [hate](https://twitter.com/hossainkhan/status/1264173083885273088) relationship with Medium with a much higher percentage towards love 🥰. I have been craving for 🌗 dark/night-mode support for the web site for a long time. Thankfully they *already support* dark-mode on the [Android](https://play.google.com/store/apps/details?id=com.medium.reader) & [iOS](https://apps.apple.com/us/app/medium/id828256236) app 😍.

![](https://cdn-images-1.medium.com/max/800/1*grPD5DOUzGhIm2ERd70ARg.jpeg)

[https://momentum.medium.com/](https://momentum.medium.com/)

Recently Medium has launched “**MOMENTUM** — *A Medium blog about the fight against anti-Black racism*” — a great initiative by them ✊. An interesting thing to note is the site supports dark mode. In fact, it only is in dark-mode which goes with the theme of the topic.

*ps. I also built an* [*Android app*](https://github.com/amardeshbd/android-police-brutality-incidents) *to support* `*#BlackLivesMatter*` *cause. Currently waiting for Google to approve the app.*

If having a completely dark theme for MOMENTUM is possible, then supporting site-wide dark-mode (aka. Night Mode) should also be possible. I am hopeful that sometime soon they may publish user settings to turn on dark-mode like few other major sites (eg. YouTube, Reddit, Slack and so on).

#### Can we have dark-mode now?

There are actually several ways to get dark-mode for any major\* site through browser plugins. Here are a few of them that I am aware of:

-   Dark Reader — [https://darkreader.org/](https://darkreader.org/)
-   Dark Mode — [https://mybrowseraddon.com/dark-mode.html](https://mybrowseraddon.com/dark-mode.html)
-   Turn Off The Lights — [https://www.turnoffthelights.com/](https://www.turnoffthelights.com/)
-   Night Eye — [https://nighteye.app/](https://nighteye.app/)
-   Stylish (custom theme per site) — [https://userstyles.org/](https://userstyles.org/)

From my experience, the ‘Dark Reader’ plugin works the best in most scenarios. However, just inverting color or doing other tricks does not work all the time. But it is at least way better than not having an option at night, especially when the 💡 light is off.

#### My personal (🚧 experimental) take!

A long time ago I used to work as a web engineer 🤓, and have some understanding of CSS. One day I got bored and started tinkering with Medium’s CSS using chrome ‘[Developer Tools](https://developers.google.com/web/tools/chrome-devtools)’ and did some brute-force style change to have my own custom dark mode. It currently only works for Front Page and some publishers I care about 🤷.

![](https://cdn-images-1.medium.com/max/800/1*cVcouD_2V6i2CDIVDW8Szg.png)

This is achieved by using [https://add0n.com/stylus.html](https://add0n.com/stylus.html) browser plugin and using my custom CSS which can be found at [https://gist.github.com/amardeshbd/f1819d7866de844e780a9b35516ea70e](https://gist.github.com/amardeshbd/f1819d7866de844e780a9b35516ea70e)

Surprisingly medium uses cryptic CSS style classes, which seems like auto-generated to deter people like me from customizing the site⁉️ 🤔

Anyway, I hope they add dark theme for the site and allow users to switch between dark and light themes. ✌️

> UPDATE (Feb 2021): Dark mode is still not supported globally on Medium, however, in case you haven’t noticed all my blogs are in dark-mode 🌓. Thanks to their theming support for each publisher or author. Hope they support it some day globally.

> UPDATE #2 (Apr 2023): Custom profile colors are no longer supported. See [https://blog.medium.com/an-update-on-profile-colors-and-themes-2cb471e61e40](https://blog.medium.com/an-update-on-profile-colors-and-themes-2cb471e61e40)

> However, there might be hope (based on the post above)

> **Will Medium build dark mode?**

> “We’re considering it! We’re also considering other reader-facing customizations to meet specific accessibility needs. We know there’s much more we can do to make Medium accessible for everyone, and this change is just a first step. If you have suggestions for customizations we could build, let us know in the responses.”
