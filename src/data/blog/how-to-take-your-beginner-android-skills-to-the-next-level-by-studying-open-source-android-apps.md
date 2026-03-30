---
title: How to take your beginner Android skills to the next level by studying open-source Android Apps
description: Article contains list of Android Open-Source apps that are fully featured and ideal for learning different techniques.
pubDatetime: 2020-04-02T03:06:58.182Z
tags: ["android", "open-source", "learning"]
featured: false
draft: false
---


![](https://cdn-images-1.medium.com/max/800/1*iJVVNMgDbOefR2A3XFNRyQ.jpeg)

This list of open-source Android apps may come in handy if you have grasped all necessary concepts to develop Android application and you think you are ready to work on an application that follows industry standards. By industry standards, I mean, an app that has good architecture, is scalable and maintainable in the long run.

Here is the list of open-source apps in this article:

-   **Android Architecture Blueprints v2** — *Google’s official recommended app*
-   **Plaid 2.0** — *Google’s official recommended app with focus on Material Design*
-   **Sunflower** — *Google’s official recommended app with more focus on many Jetpack components*
-   **CatchUp** — *Community app with multi-module and multi-api-service*
-   **Showcase** — *Community app with multi-module and clean architecture*
-   **Google I/O** — *Google’s official annual conference app*
-   **Tivi** — *Community app with a focus on multi-module architecture and Jetpack*

> FYI: Google has an 📚 [**official architecture guide for Android application**](https://developer.android.com/jetpack/docs/guide) which captures what most of the sample application does. I highly recommend you read that article first before studying any open-source applications.

### ⚙️ Android Architecture Blueprints v2

This is Google’s official app that showcases the usage of some of the key [Jetpack](https://developer.android.com/jetpack) components to make a sustainable app. This is a good starting point to get an understanding of how to architect an app.

They do have a vanilla implementation in `master` branch, however, I will focus on `dagger-android` branch that has dagger support *(see README)*.

-   **Language:** Kotlin
-   **Architecture:** MVVM
-   **Dependency Injection:** Dagger
-   **Navigation:** Jetpack Navigation
-   **Unit Tests:** JUnit and Espresso
-   **Source:** [https://github.com/android/architecture-samples](https://github.com/android/architecture-samples)

### 👔 Plaid 2.0 — Showcasing Material Design

In early days Plaid 1.0 application (created in 2014) was [Nick Butcher](https://twitter.com/crafty)’s app where he showcased how [material design](https://material.io/) and animation can bring joy and life to an Android application. After years of improving, the Plaid app has come to a point where it makes perfect sense to make this app a reference app that showcases how an ideal Android application can be built using material design and fluid animation. So, in 2019, Nick did exactly that, they have moved the Plaid Github repo to Google’s official repository — [here is the article explaining the move and goal](https://medium.com/@crafty/restitching-plaid-9ca5588d3b0a) *(I highly recommend to read it)*.

NOTE: The Plaid 2.0 is still under heavy development, which as a bonus, gives you an opportunity to learn how an application is migrated to modern architecture and Kotlin. See the GitHub project page with different technical articles explaining how the app is being migrated to 2.0

-   **Key Features:** Material Design, Android Theming, Dark Mode, Multi-Module, Animation
-   **Language:** Kotlin
-   **Architecture:** MVVM
-   **Dependency Injection:** Dagger
-   **Navigation:** Plain (intent based)
-   **Unit Tests:** JUnit and Espresso
-   **Source:** [https://github.com/android/plaid](https://github.com/android/plaid)

---

![](https://cdn-images-1.medium.com/max/1200/1*jgsbsIWacu4JvnhPpVUuJg.jpeg)

Snapshot of Plaid 1.0 — The latest 2.0 app is still under heavy development.

---

### 🌻 Sunflower — Showcasing Android Jetpack

This is another Google’s official app that showcases many Jetpack components in one application.

This is a minimal application that is great for learning.

-   **Key Features:** Dark Mode, Animation, Room (Database), WorkManager
-   **Language:** Kotlin
-   **Architecture:** MVVM (LiveData, ViewModel, Lifecycle, Data Binding)
-   **Dependency Injection:** None (Dagger not used to keep it simple)
-   **Navigation:** Jetpack Navigation (Single Activity)
-   **Unit Tests:** JUnit and Espresso
-   **Source:** [https://github.com/android/sunflower](https://github.com/android/sunflower)

---

![](https://cdn-images-1.medium.com/max/1200/1*-GJ_m-AWu8Ro235pXt8_AA.png)

Sunflower — Demo Screenshots

---

### 🔖 CatchUp — All in one

This app aggregates articles and posts from different services like Hackernews, Medium, Reddit, Slashdot, Dribble, Uplabs and so on. This is a very recent app from [Zac Sweers](https://www.zacsweers.dev/) who has put a significant amount of time to develop this app. The app architecture is [inspired](https://github.com/ZacSweers/CatchUp#influences) by Plaid and U+2020 app. CatchUp is being actively developed, you can clone and build locally to try it out.

Please note, this is a kinda large-scale, complex application that is well done and contains many advanced techniques. So, if you are a beginner, I would postpone looking into the application towards the end of your study ^\_^

> ps. I, myself have [found](https://twitter.com/rharter/status/1240773309316378626?s=20) this application recently. Personally I like how the Gradle script is organized using Kotlin based Gradle scripts (kts), and how the dagger is used extensively to manage dependencies of different component and service implementations.

-   **Key Features:** Dark Mode, Animation, Advanced Dagger,
-   **Language:** Kotlin
-   **Architecture:** — (Not sure, I need to study this app more)
-   **Dependency Injection:** Dagger Hilt (Advanced usage)
-   **Navigation:** Basic (Intent Based)
-   **Unit Tests:** Some JUnit tests exist (not priority).
-   **Source:** [https://github.com/ZacSweers/CatchUp](https://github.com/ZacSweers/CatchUp)

---

![](https://cdn-images-1.medium.com/max/1200/1*xBXnT6pYfL_4LFI1r7rp5Q.png)

CatchUP — Demo Screenshots

---

> NOTE: As per Zac, he recently [tweeted](https://twitter.com/ZacSweers/status/1274830421835100162?s=20) “standard disclaimer that CatchUp is not necessarily a template of patterns I endorse or recommend. It’s a laboratory not a representative sample”

### Showcase — clean architecture

This is another community sample that I discovered recently. The sample app is developed by [Igor Wojda](https://twitter.com/igorwojda), author of “*Android Development with Kotlin*” [book](https://www.amazon.ca/Android-Development-Kotlin-Marcin-Moskala/dp/1787123685).

The showcase app incorporates many best practices, here is the project summary on Igor’s own words:

> Android application following best practices: Kotlin, coroutines, Clean Architecture, feature modules, tests, MVVM, static analysis.

-   **Key Features:** Kotlin and Coroutines, Gradle KTS, Static Code Analysis
-   **Language:** Kotlin
-   **Architecture:** Clean Architecture
-   **Dependency Injection:** None (Manual)
-   **Navigation:** Jetpack Navigation
-   **Unit Tests:** JUnit
-   **Source:** [https://github.com/igorwojda/android-showcase](https://github.com/igorwojda/android-showcase)

---

### Honorable mention

Here are some open-source apps that are worth mentioning:

#### 🎤 Google I/O Annual Conference App

Since 2011 the Google I/O companion application has been the spotlight application by Google that showcases the latest Android features. It recently incorporated Android Wear and Auto variants too.

[Historically](https://github.com/google/iosched/issues/309) the source code of the app is released 3–5 months after the conference. Still, it is a great complete application for studying.

-   **Key Features:** Multiform factor (Mobile, Tablet, Wear OS, Auto, TV), Firebase, WorkManager, Dark Mode (2019)
-   **Language:** Kotlin (2018-2019+), Java (2011–2017)
-   **Architecture:** MVVM (2019)
-   **Dependency Injection:** Dagger Hilt
-   **Navigation:** Jetpack Navigation (2019)
-   **Unit Tests:** JUnit and Espresso
-   **Source:** [https://github.com/google/iosched](https://github.com/google/iosched)

---

![](https://cdn-images-1.medium.com/max/1200/1*wYRpiq0kWWgx9q1TVJzapg.png)

Google I/O 2019 — Demo Screenshots

---

#### 📺 Tivi — Track Show Tracking

Tivi app is currently in the early stages developed by [Chris Banes](https://twitter.com/chrisbanes), a member of the Android Developer Relations team. He closely works with [Nick Butcher](https://twitter.com/crafty), author of Plaid.

The app uses all the latest libraries and recommendations from Google. This app has a very modular structure, almost everything is divided into modules (about 29 modules as of writing). This app will be a good study material when the app goes into the beta stage. Now, it’s too early to recommend as main study material.

-   **Key Features:** Dark Mode, Multi-Module, Multi-Service (Trakt, TMDb), Room (Database), RxJava 2
-   **Language:** Kotlin
-   **Architecture:** MVVM + Lifecycle + LiveData
-   **Dependency Injection:** Dagger Hilt
-   **Navigation:** Jetpack Navigation
-   **Unit Tests:** JUnit (Under active development)
-   **Source:** [https://github.com/chrisbanes/tivi](https://github.com/chrisbanes/tivi)

---

![](https://cdn-images-1.medium.com/max/1200/1*lBKt8TfnSonAiD5F904TQg.png)

Tivi — Demo Screenshots

---

I will continue to extend this article to include more community projects. Feel free to share projects that are ideal for learning. Thanks 🙏
