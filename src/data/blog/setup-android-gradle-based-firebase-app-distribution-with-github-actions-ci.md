---
title: Setup Android Gradle based Firebase App Distribution with GitHub Actions CI
description: A quick guide on how to set up Github Actions CI workflow to automatically post APK to Firebase App Distribution from your Android project.
pubDatetime: 2020-06-16T12:50:37.864Z
tags: ["android", "gradle", "firebase", "ci"]
featured: false
draft: false
---

This is a quick guide on how you can easily set up Github Actions CI workflow to automatically post APK to [Firebase App Distribution](https://firebase.google.com/docs/app-distribution) on merge to `release` or `master` (or soon to be known as `main`) branch.

Firebase already has an [**excellent guide**](https://firebase.google.com/docs/app-distribution/android/distribute-gradle) 🏆 on how to set up the Gradle task on your Android project to post APK to App Distribution. However, I will quickly touch those areas using the easiest path ✌️.

> **PREREQUISITE**: You already have Firebase project setup for the app with `google-services.json` file in your Android app project.

#### Setup Gradle for the App

On your root `build.gradle` file add the Gradle plugin

```groovy
dependencies {
    // .. more existing dependencies here
    classpath 'com.google.firebase:firebase-appdistribution-gradle:2.0.0' // see official guide for latest versions
}
```

Next, apply the plugin in your Android app’s `build.gradle` and distribution properties. See the [official guide](https://firebase.google.com/docs/app-distribution/android/distribute-gradle#step_3_configure_your_distribution_properties) for the full list of supported parameters.

```groovy
apply plugin: 'com.google.firebase.appdistribution'
```

```groovy
android {
    buildTypes {
        release { // NOTE: `debug` can have different configs too
            firebaseAppDistribution {
                releaseNotes="Release notes at bit.ly/notes"
                groups="qa" // see docs for more options
            }
        }
    }
}
```

#### Generate Firebase Token

Firebase has [3 different documented ways](https://firebase.google.com/docs/app-distribution/android/distribute-gradle#step_2_authenticate_with_firebase) you can authenticate to be able to upload the APK. Generating the token is one of the easiest that I will focus on with snapshot images so that you can easily relate to it.

![](https://cdn-images-1.medium.com/max/800/1*_EC-NBCkx-VwM9m_0O1D6g.png)

From the root of your android app project, run following Gradle command which will give you a URL to authenticate for the Firebase project that app uses.

```bash
./gradlew appDistributionLogin
```

Copy the URL `https://accounts.google.com/o/..../auth/cloud-platform` and paste it in browser and login with the Google account which has write access to the Firebase project.

![](https://cdn-images-1.medium.com/max/800/1*BWREQVxtFP-tTRq0QrbXYw.png)

Once authorized, you should get `FIREBASE_TOKEN` in the console. Save it for later use.

#### Setup Secrets for GitHub CI Workflow

Go to your GitHub project and add the `FIREBASE_TOKEN` as a secret property.

![](https://cdn-images-1.medium.com/max/800/1*5E6cFFg4aMiJv58WLyS9uA.png)

#### Setup GitHub Actions CI Workflow

Based on git-flow, we want to set up the CI job such that whenever we merge commit to `master` branch it triggers the release build. You can obviously [customize the behavior](https://help.github.com/en/actions/reference/events-that-trigger-workflows) based on your need.

```yaml
name: Firebase App Distribution

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8

      - name: Firebase App Distribute
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: ./gradlew assembleRelease appDistributionUploadRelease
```

That’s it, you should have a working GitHub workflow that automatically sends APK to Firebase App Distribution as soon as there is a commit on `master` branch.

See [pull-request I made](https://github.com/amardeshbd/android-police-brutality-incidents/pull/117/files) to add support for this in one of my side projects.

If you find any issues please let me know I will try to help. Good luck 👍

---

#### Additional Resources

- Firebase App Distribution — [https://firebase.google.com/docs/app-distribution](https://firebase.google.com/docs/app-distribution)
- GitHub Actions — [https://help.github.com/en/actions](https://help.github.com/en/actions)
- Pull Request to support Firebase App Distribution — [https://github.com/amardeshbd/android-police-brutality-incidents/pull/117/files](https://github.com/amardeshbd/android-police-brutality-incidents/pull/117/files)
