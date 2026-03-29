---
title: Quick Trick — Use Android’s Animated Vector Drawable as ProgressBar
description: Trick on how to create Android custom indeterminate progress bar behaviour using ImageView and Animated Vector Drawable
pubDatetime: 2020-08-06T04:33:08.758Z
tags: ["android", "ui", "animation"]
featured: false
draft: false
---


![](https://cdn-images-1.medium.com/max/1200/1*vEfWna5Bawp65JD0X4m1-A.png)

Preview of [https://shapeshifter.design/](https://shapeshifter.design/) editing animated vector drawable (AVD).

---

Android’s [ProgressBar](https://developer.android.com/reference/android/widget/ProgressBar) widget comes with lot of customization controls and flexibility to set custom animated drawable. However, setting [AnimatedVectorDrawable](https://developer.android.com/reference/kotlin/android/graphics/drawable/AnimatedVectorDrawable?hl=en) is not one of the option.

So, this is a quick trick on how to use custom ImageView to create indeterminate progress indicator using Animated Vector Drawable (AVD).

```
class AvdLoadingProgressBar @JvmOverloads constructor*(*    context: Context,  
    attrs: AttributeSet? = null,  
    defStyleAttr: Int = 0  
*)* : AppCompatImageView*(*context, attrs, defStyleAttr*) {*    private val avd = AnimatedVectorDrawableCompat.create*(*context, R.drawable.avd\_anim*)*!!  
  
    init *{*        setImageDrawable*(*avd*)*        avd.registerAnimationCallback*(*object : Animatable2Compat.AnimationCallback*() {*            override fun onAnimationEnd*(*drawable: Drawable?*) {*                post **{** avd.start*()* **}**            *}  
        })*        avd.start*()  
    }  
}*
```

Here is more verbose Gist version of the snippet above

> NOTE: The idea of repeated indefinite AVD is heavily borrowed from Nick Butcher’s medium article on AVD. I highly recommend you read them to know more tips and ticks with AVD.

That’s it. You can now use this in your layout as usual view and show it when data is loading from network or any long running async request is happening.

```
*<*androidx.constraintlayout.widget.ConstraintLayout>
```
```
  *<*dev.hossain.avdprogress.AvdLoadingProgressBar  
    android:layout\_width="wrap\_content"  
    android:layout\_height="wrap\_content"  
    app:srcCompat="@drawable/avd\_anim\_kijiji\_loading" */>*
```
```
*</*androidx.constraintlayout.widget.ConstraintLayout*\>*
```

![](https://cdn-images-1.medium.com/max/800/1*kJDC8wIDX1tV5ah4Y-xehw.gif)

Here is preview of the AVD in [https://shapeshifter.design/](https://shapeshifter.design/)

#### Further reading

[**Animation: Jump-through** — *Recently a call for help caught my eye; asking how to implement a fancy ‘getting location’ animation on Android:*](https://medium.com/androiddevelopers/animation-jump-through-861f4f5b3de4)
[**Re-animation** — *In a previous article, I described a technique for creating vector animations on Android:*](https://medium.com/androiddevelopers/re-animation-7869722af206)
