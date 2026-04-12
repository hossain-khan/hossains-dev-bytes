---
title: "Hackathon: Creating the simplest Muzei Wallpaper plugin for Android"
description: A short article showcasing how to build Muzei Live Wallpaper plugin for Android using two simple steps.
pubDatetime: 2020-05-24T06:33:28.566Z
tags: ["android", "hackathon", "wallpaper"]
featured: false
draft: false
---

![](https://cdn-images-1.medium.com/max/1200/1*q-e76ZofPWRVjuaE2vxNDw.png)

A snapshot of the ‘H.K. Vision’ Muzei Plugin on Android Device — Available as [BETA release](https://play.google.com/store/apps/details?id=com.hossainkhan.vision) on Google Play

---

I have a hobby of taking a lot of pictures, and some of the pictures do turn out nice (_at least to me_ 😊). So, I’ve also created a [web portal](https://vision.hossainkhan.com/) to showcase those pictures 🖼️.

As an Android engineer, I was aware of [**Muzei Live Wallpaper**](https://play.google.com/store/apps/details?id=net.nurik.roman.muzei) app created by [Roman Nurik](https://medium.com/u/90c74515fd18) back in 2014. Recently I’ve seen some updates from [Ian Lake](https://medium.com/u/51a4f24f5367) who took over the project a while ago, so I decided to make a plugin for Muzei to use my pictures as wallpaper on my Android phone.

> ps. If you simply want to use the plugin, see [README](https://github.com/hossain-khan/android-hk-vision-muzei-plugin/blob/master/README.md) for instruction 🤗

---

The **_objective of this post_** is to showcase how easy it was for **_me_** to work on this ⏰ 1-day hackathon project to create the plugin for Muzei by following [guidelines](https://github.com/romannurik/muzei/blob/master/muzei-api/module.md) and examples provided in the Muzei [GitHub repository](https://github.com/romannurik/muzei).

Essentially, I had to do 2 major tasks to create the Android plugin

1.  Download a list of image URLs+metadata and convert them into `Artwork` object.
2.  Declare a content provider on `AndroidManifest.xml` to expose the images for Muzei Live Wallpaper app.

#### Download Image Metadata

You can use any library of your choice to do that, I’ve followed the [unsplash example](https://github.com/romannurik/muzei/tree/master/example-unsplash/src/main/java/com/example/muzei/unsplash) and used Retrofit+WorkManager to download metadata and convert the images into `Artwork` objects. See [source code snapshot](https://github.com/hossain-khan/android-hk-vision-muzei-plugin/blob/master/app/src/main/java/com/hossainkhan/vision/data/HkVisionWorker.kt) from GitHub.

#### Expose Content Provider

Based on `MuzeiArtProvider` [documentation](https://api.muzei.co/reference/com.google.android.apps.muzei.api.provider/-muzei-art-provider/index.html), I extended my `[HkVisionArtProvider](https://github.com/hossain-khan/android-hk-vision-muzei-plugin/blob/master/app/src/main/java/com/hossainkhan/vision/muzei/HkVisionArtProvider.kt)` from it and defined following provider specification in `AndroidManifest.xml`

---

![](https://cdn-images-1.medium.com/max/1200/1*Wc_NtCluWXrOokPaWsGICg.png)

[Source code](https://github.com/hossain-khan/android-hk-vision-muzei-plugin/blob/master/app/src/main/AndroidManifest.xml#L15) available at the GitHub repository

---

That’s it. Once you build and install the APK, the source will show up in the Muzei Live Wallpaper [app](https://play.google.com/store/apps/details?id=net.nurik.roman.muzei) which allows you to choose a wallpaper from a list of photos that was added to Muzei artwork [provider client](http://api.muzei.co/reference/com.google.android.apps.muzei.api.provider/-provider-client/index.html).

---

I have released the plugin app on Google Play as a _public_ release. If you are interested, then [get it on Google Play](https://play.google.com/store/apps/details?id=com.hossainkhan.vision). If you do like the wallpapers, feel free to drop a line here. ✌️

💻 Source code of the Android project is available at GitHub repo below:

[**hossain-khan/android-hk-vision-muzei-plugin** — _Muzei Live Wallpaper app's photo data source plugin for vision.hossainkhan.com website. _](https://github.com/hossain-khan/android-hk-vision-muzei-plugin)
