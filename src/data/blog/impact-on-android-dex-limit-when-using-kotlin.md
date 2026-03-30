---
title: Impact on Android dex limit when using Kotlin
description: I’ve been following Kotlin for a while, and after Google I/O 17 announcement it became the officially supported language for Android.
pubDatetime: 2017-07-18T20:11:31.489Z
tags: ["android", "kotlin", "performance"]
featured: false
draft: false
---


I’ve been following Kotlin for a while, and after Google I/O 17 [announcement](https://developer.android.com/kotlin/index.html) it became the officially supported language for Android.

Naturally the interest also [spiked](https://trends.google.com/trends/explore?cat=31&q=Kotlin) after the [announcement](https://blog.jetbrains.com/kotlin/2017/05/kotlin-on-android-now-official/).

![](https://cdn-images-1.medium.com/max/800/1*eJHybG6eA4AvU-yhehLtlw.png)

I was curious to know how much does it cost to use Kotlin in Android, but wasn’t able to find a quick answer after googling (maybe I didn’t search enough ¯\\\_(ツ)\_/¯). So, wanted to check myself using tools described in [http://www.methodscount.com/about](http://www.methodscount.com/about)

![](https://cdn-images-1.medium.com/max/800/1*LYrO5hFa0PV6_-d6lVToCA.png)

APK with Kotlin — Method Count

Here is a snapshot of methods count from sample app [https://github.com/googlesamples/android-NotificationChannels](https://github.com/googlesamples/android-NotificationChannels) comparing Kotlin vs. non-Kotlin APK *(both APKs were built using* `*./gradlew assembleDebug*` *from their respective project root)*.

\* Kotlin App Method Count: **24,218** *(using version* [*1.1.2–4*](https://github.com/googlesamples/android-NotificationChannels/blob/master/kotlinApp/Application/build.gradle#L5)*)*  
 \* Non-Kotlin App Method Count: **18,047**  
 \* Method Count Difference: **6,171** *(Library Methods: 5748)*

![](https://cdn-images-1.medium.com/max/800/1*EuWHGaEdSd6zLy1TljHVig.png)

APK without Kotlin — Method Count

So, around **6K** method count for using fun & amazing language Kotlin is insignificant compared to support library and google play services which combined can easily be over **20K** methods.

By using ProGuard we can also greatly reduce the number of method count.

---

![](https://cdn-images-1.medium.com/max/800/1*am9SMewweJs9_H1oIATuuQ.png)

Kotlin Method Count by Package

Here are some interesting observations from the method count graph — It seems they have heavily invested in [collections](http://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html) framework to make it better, and the next big chunk is taken by [text/string](http://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/index.html) related classes.

*P.S. Feel free to correct me if you find any wrong or misleading information.*
