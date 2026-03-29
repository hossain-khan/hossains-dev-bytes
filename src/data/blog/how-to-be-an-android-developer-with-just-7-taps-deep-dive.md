---
title: How to be an Android Developer with just 7 taps. Deep Dive 🔎
description: In the past few years, the Android ecosystem has exploded with lots of tools, libraries, and architecture guidelines. Recently, with I/O…
pubDatetime: 2019-05-21T00:24:42.228Z
tags: []
featured: false
draft: false
---


> DISCLAIMER: This is a non-technical just-for-fun post!

In the past few years, the Android ecosystem has exploded with lots of tools, libraries, and architecture guidelines. Recently, with I/O 2017 announcement of Kotlin support, it just added another dimension.

Today, I am going to show you quickest way of becoming an Android Developer regardless of language and plethora of libraries, all you need is a physical Android device.

#### Becoming Android developer

![](https://cdn-images-1.medium.com/max/800/1*YLGSzHtfjOjyz2cBzZ8YdQ.png)

On your device, go to `Settings > About` and find “**Build Number**”

> p.s. The “Build Number” may be burried under additional sub section based on device manufacturer like LG, Samsung, HTC and so on. You just need to find it 🤓.

Now, all you need to do is keep tapping the build number value until it says you have become a developer. And that’s it!

Here is how I became a developer using my Pixel 2 XL device:

<iframe src="https://www.youtube.com/embed/JSNRZhzMsLU" width="700" height="393" frameborder="0"></iframe>

A short clip showcasing how to enable ‘Developer options’

If you made this far, you know this is a *joke* 🙈! By now, every Android devs know how to activate the developer options on any Android device.

However, back in the days, there was no tapping required to activate it, it was always there. So, when they added this feature, I’ll be honest, I did have to Google for it 😁.

---

#### Under the hood

As I was curious, I wanted to see how the logic works in the Android settings screen. I found that all these logic of activating the developer options is in [**BuildNumberPreferenceController.java**](https://android.googlesource.com/platform/packages/apps/Settings/+/master/src/com/android/settings/deviceinfo/BuildNumberPreferenceController.java) (*AOSP*) source code.

First, the most important constant that defines how many times we have to tap to become the ‘developer’ is:

```
static final int **TAPS\_TO\_BE\_A\_DEVELOPER** = **7**;
```

Why 7? Maybe because it’s considered a lucky number? ¯\\\_(ツ)\_/¯

#### Pre-conditions

Here some of the pre-conditions that have to be met before developer settings can be activated by tapping 7 times on the build number.

-   Admin user of the device (using [UserManager](https://developer.android.com/reference/android/os/UserManager.html))
-   Device Provisioning is complete
-   Tapping is not done by [monkey-runner](https://developer.android.com/studio/test/monkeyrunner)
-   Debugging feature is not disabled by Device Owner/Work Profile

After these requirements are met, all there is left to do is count-down the number of taps. Here is a *simplified* code snapshot with some added inline comments:

```
if (mDevHitCountdown > 0) {  
    mDevHitCountdown--;  
    if (mDevHitCountdown == 0 && !mProcessingLastDevHit) {  
        // Open the lock screen validation screen before activating  
        mProcessingLastDevHit = helper.launchConfirmationActivity();  
        if (!mProcessingLastDevHit) {  
            // Activates developer settings after lock verification  
            enableDevelopmentSettings();  
        }  
    } else if (mDevHitCountdown > 0  
            && mDevHitCountdown < (TAPS\_TO\_BE\_A\_DEVELOPER - 2)) {  
  
        // Show - "You are X taps away from being developer."  
        mDevHitToast = Toast.makeText(getQuantityString(  
                        R.plurals.show\_dev\_countdown,  
                        mDevHitCountdown,  
                        mDevHitCountdown),  
                Toast.LENGTH\_SHORT);  
        mDevHitToast.show();  
    }  
} else if (mDevHitCountdown < 0) {  
    // This means, you have already tapped 7 times, you're a DEV!  
    mDevHitToast = Toast.makeText(R.string.show\_dev\_already,  
            Toast.LENGTH\_LONG);  
    mDevHitToast.show();  
}
```

That’s it, mystery solved 🎉
