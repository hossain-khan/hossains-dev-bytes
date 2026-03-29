---
title: Source code syntax highlighting on Android — Taking full control
description: Tips on how to take full control and create your own custom-view to add syntax highlighting support in your Android app.
pubDatetime: 2020-07-18T22:13:00.452Z
tags: []
featured: false
draft: false
---


Android and it’s community has evolved a lot over past decade. Now a days we can find open-source libraries to do almost anything — Zoomable ImageView, CameraX, RecyclerView Sticky Header, Tooltip, and many more.

![](https://cdn-images-1.medium.com/max/800/0*Ywlp-1OAf-_EgtyR)

Photo by [Shahadat Rahman](https://unsplash.com/@hishahadat?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

Syntax highlighting is one of them and there are [few](https://github.com/kbiakov/CodeView-Android) [libraries](https://github.com/PDDStudio/highlightjs-android) [for](https://github.com/Badranh/Syntax-View-Android) [that](https://github.com/testica/codeeditor) too. If this is a solved problem, then why am I writing about another solution then?

Well, some of the libraries I have explored are outdated, and some of them might not be as feature rich. So, I wanted to explore how to do-it-myself and write about it so that anybody can take full advantage of well-know JavaScript libraries for syntax highlighting in their Android app.

👍 **Pros**

-   Complete control over how JS plugin is used in the app
-   Complete control over the Android code that renders it using `WebView`

👎 **Cons**

-   You need to have some understanding of web technologies, namely HTML, CSS and JavaScript
-   You need to build your own Android `CustomView` or `Fragment` to render highlighted syntax. *(No worries — this is where this article comes in to help you do that* 🤗*)*

With the pros and cons in mind, lets explore some well-established and proven syntax highlighting libraries

-   [**PrismJS**](https://prismjs.com/index.html) — Very light weight `2KB-100+KB` with extensive plugin collection  
    “*Lightweight, robust, elegant syntax highlighting.*”
-   [**highlight.js**](https://highlightjs.org/) — Fully loaded `25KB-100KB` and simple syntax highlighting  
    “*Syntax highlighting for the Web”*
-   [**Rainbow**](https://craig.is/making/rainbows) — Another popular lightweight `6KB-25KB` highlighter  
    “*Rainbow is a code syntax highlighting library written in Javascript.*”

There are many more libraries that does the job, however for rest of the example I will be using PrismJS because of it’s highly modular nature. Note that, the process of using different library will be *almost* the same.

> 💡 TIP: All the example code provided here is available in great detail in the GitHub repository mentioned below👇.

#### Setting up PrismJS Template

We will be leveraging Android’s`WebView` to load syntax highlighting library with the source code that we want to be highlighted.

This setup is going to be specific to library of your choice. Since we are focusing on PrimsJS, we will follow it’s [official guideline](https://prismjs.com/#basic-usage).

After you [download](https://prismjs.com/download.html) the library JS and CSS file, you essentially need following HTML to render the highlighted source.

```
<!DOCTYPE html>  
<html>  
  <head>  
    <link href="themes/prism.css" rel="stylesheet" />  
    <script src="prism.js"></script>  
  </head>  
  <body>  
    <pre><code class="language-kotlin">  
    data class Student(val name: String)  
    </code></pre>  
  </body>  
</html>
```

> TIP: You can download different CSS theme, and you can choose list of language and plugin you want to support (eg. Kotlin, Show line number)

Put the downloaded files in your Android app’s assets directory, ideally in www subfolder, like — `src/main/assets/www/`

Now that we have a baseline for the template, next part is to convert it to Kotlin function that can take additional parameter to customize different plugin options. Here is template with some additional data needed for mobile.

```
**fun prismJsHtmlContent**(  
    formattedSourceCode: String,  
    language: String,  
    showLineNumbers: Boolean = true  
): String {  
    return """<!DOCTYPE html>  
<html>  
<head>  
    <meta name="viewport" content="width=device-width, initial-scale=1">  
  
    <link href="www/prism.css" rel="stylesheet"/>  
    <script src="www/prism.js"></script>  
</head>  
<body>  
<pre class="${if (**showLineNumbers**) "line-numbers" else ""}">  
<code class="language-${**language**}">${**formattedSourceCode**}</code>  
</pre>  
</body>  
</html>  
"""  
}
```

#### Defining Syntax Highlighting Custom-View

Making your own custom view is a great way to enhance capabilities. In this case we want to make our custom-view extend from `WebView` so that we can load the template we just defined with source code at runtime.

```
package your.app.code
```
```
class SyntaxHighlighterWebView [@JvmOverloads](http://twitter.com/JvmOverloads "Twitter profile for @JvmOverloads") constructor(  
    context: Context,  
    attrs: AttributeSet? = null,  
    defStyleAttr: Int = 0  
) : **WebView**(context, attrs, defStyleAttr) {  
    companion object {  
        private const val ANDROID\_ASSETS\_PATH = "file:///android\_asset/"  
    }
```
```
    // Our exposed function to show highlighted syntax  
    **fun bindSyntaxHighlighter**(  
        formattedSourceCode: String,  
        language: String,  
        showLineNumbers: Boolean = false  
    ) {  
        settings.javaScriptEnabled = true
```
```
         loadDataWithBaseURL(  
            ANDROID\_ASSETS\_PATH /\* baseUrl \*/,  
            **prismJsHtmlContent**(  
               formattedSourceCode,   
               language,   
               showLineNumbers  
            ) /\* html-data \*/,  
            "text/html" /\* mimeType \*/,  
            "utf-8" /\* encoding \*/,  
            "" /\* failUrl \*/  
        )  
    }  
}
```

#### Using the Custom-View in App

Now that we have our `SyntaxHighlighterWebView` custom-view with `bindSyntaxHighlighter()` function, we can use it from Activity or Fragment layout.

All we need to do is use the view in XML layout like following:

```
<your.app.code.SyntaxHighlighterWebView  
  android:id="@+id/syntax\_highlighter\_webview"  
  android:layout\_width="match\_parent"  
  android:layout\_height="match\_parent" />
```

And from your `Activity` or `Fragment` get reference to the view and bind the source code like following

```
val highlighter: SyntaxHighlighterWebView = findViewById(R.id.syntax\_highlighter\_webview)  
  
highlighter.**bindSyntaxHighlighter**(  
   formattedSourceCode = "data class Student(val name: String)",  
   language = "kotlin",  
   showLineNumbers = true  
)
```

![](https://cdn-images-1.medium.com/max/800/1*MvZ2lVaLqGOW5j0hC6Mitg.png)

Highlighted Syntax Loaded via SyntaxHighlighterWebView

That’s it, once you load the app you should see highlighted syntax on the screen where you have put the custom-view.

---

All the example source code provided here is available in following GitHub repository. As bonus, I have also provided example of how to use highlight.js too.

If you find any issue, leave a comment here or report an issue at GitHub repository. Hope it helps somebody. ✌️

[**amardeshbd/android-syntax-highlighter** — *Yet Another Android Syntax Highlighter (YAASH). Example of how to use any JavaScript library to enable syntax highlighting in your android app.*](https://github.com/amardeshbd/android-syntax-highlighter)

![](https://cdn-images-1.medium.com/max/800/1*mOgncKuhm9vj_kpE1LupSg.jpeg)

Set of screenshots taken from the demo app
