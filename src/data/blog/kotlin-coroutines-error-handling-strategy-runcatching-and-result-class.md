---
title: Kotlin coroutines error handling strategy — `runCatching` and `Result` class
description: Use Kotlin’s standard function `runCatching` API to handle errors from standard or coroutines functions.
pubDatetime: 2021-05-02T20:45:33.105Z
tags: ["kotlin", "coroutines", "error-handling"]
featured: false
draft: false
---


I am trying to learn Kotlin coroutines, and was trying to learn more about how to handle errors from suspended functions. One of the [recommended way](https://developer.android.com/kotlin/coroutines) by Google is to create a “Result” class like the following:

```kotlin
sealed class Result {    data class Success(val data: T) : Result()    data class Error(val exception: Exception) : Result()}
```

This allows us to take advantage of Kotlin’s `when` like following:

```kotlin
when (result) {  
    is Result.Success<LoginResponse> -> // Happy path  
    else -> // Show error in UI  
}
```

However, I have recently [stumbled into](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run-catching.html) Kotlin’s `runCathing {}` API that makes use of native`Result<T>` class already [available in standard lib](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/) since Kotlin `v1.3`

Here I will try to explore how the native API can replace the recommended example in the Android Kotlin [training guide](https://developer.android.com/kotlin/coroutines) for *simple* use cases.

---

![](https://cdn-images-1.medium.com/max/1200/1*km6L-1H-5oTFFKaU3LwwgA.png)

Here is a basic idea of how `runCatching {}` can be used from Android ViewModel.

---

Based on Kotlin standard lib [doc](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run-catching.html), you can use `runCatching { }` in 2 different ways. I will focus on one of them, since the concept for other one is similar.

To handle a function that may throw an exception in coroutines or regular function use this:

```kotlin
val statusResult: **Result<String>** = *runCatching* **{**    // function that may throw exception that needs to be handled  
    repository.userStatusNetworkRequest(username)  
**}**.*onSuccess* **{** status: String **\->**    *println*("User status is: $status")  
**}**.*onFailure* **{** error: Throwable **\->**    *println*("Go network error: ${error.message}")  
**}**
```
```kotlin
// Assuming following supposed\* long running network API  
suspend fun userStatusNetworkRequest(username: String) = "ACTIVE"
```

Notice the ‘[Result](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/)’ returned from the `runCatching` this is where the power comes in to write semantic code to handle errors.

The `onSuccess` and `onFailrue` callback is part of `Result<T>` class that allows you to easily handle both cases.

#### How to handle Exceptions

In addition to nice callbacks, the `Result<T>` class provides multiple ways to recover from the error and provide a default value or fallback options.

1.  **Using** `**getOrDefault()**` **and** `**getOrNull()**` **API**

```kotlin
val status: **String** = statusResult.*getOrDefault*("STATUS_UNKNOWN")
```
```kotlin
// Or if nullable data is acceptable use:  
val status: **String?** = statusResult.getOrNull()
```

Since the `onSuccess` and `onFailure` returns `Result<T>` you can chain most of these API calls like following

```kotlin
val status: **String** = *runCatching* **{**    repository.userStatusNetworkRequest("username")  
**}  
**.*onSuccess* **{}  
**.*onFailure* **{}  
**.*getOrDefault*("STATUS_UNKNOWN")
```

**2\. Using** `**recover { }**` **API**

The `recover` API allows you to handle the error and recover from there with a fallback value of the same data type. See the following example.

```kotlin
val status: **Result<String>** = *runCatching* **{**    repository.userStatusNetworkRequest("username")  
**}  
**.*onSuccess* **{}  
**.*onFailure* **{}  
**.*recover* **{** error: Throwable **\->** "STATUS_UNKNOWN" **}  
  
***println*(status.isSuccess) // Prints "true" even if error is thrown
```

**3\. Using** `**fold {}**` **API to map data**

The `fold` extension function allows you to map the error to a different data type you wish. In this example, I kept the user status as `String`.

```kotlin
val status: **String** = *runCatching* **{**    repository.userStatusNetworkRequest("username")  
**}  
**.*onSuccess* **{}  
**.*onFailure* **{}  
**.*fold*(  
    onSuccess = **{** status: String **\->** status **}**,  
    onFailure = **{** error: Throwable **\->** "STATUS_UNKNOWN" **}  
**)
```

---

Aside from these, there are some additional useful functions and extension functions for `Result<T>` , take a look at [official documentation](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-result/) for more APIs.

I hope this was useful or a new discovery for you as it was for me 😊

---

**UPDATE #1:** As Gabor has mentioned below, there is an unintended consequence about using it in coroutines. I will look into it and provide more updates on the usage soon. Thanks to Garbor for mentioning it.

> [](https://twitter.com/Zhuinden/status/1389063911702470656?s=20)
