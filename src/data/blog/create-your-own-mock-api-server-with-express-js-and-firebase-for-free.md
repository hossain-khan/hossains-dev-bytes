---
title: Create your own mock API server with Express.js and Firebase for free!
description: Recently I had to prepare a complete mocked server for an app I worked in the past. The reason mocking was required so that app’s…
pubDatetime: 2019-03-13T03:30:08.677Z
tags: []
featured: false
draft: false
---


Recently I had to prepare a complete mocked server for an app I worked in the past. The reason mocking was required so that app’s different functionality can be showcased with a variation of mocked response which triggers different UI and functionality.

There may be different solutions available in the market, however, since Firebase has a free tier that allows Node.js based [Express](https://expressjs.com/) web framework makes things much easier to customize based on need.

Google has [many many examples](https://github.com/firebase/functions-samples) for cloud functions which showcase 100s of use case, however, I just wanted to focus on using Express to mock API responses.

> **UPDATE (Feb 2021): This article may be outdated. Firebase now requires note 11 and up and a payment method is required to use the free tier. It may not be possible to provide a credit-card. Just keep these in mind and follow official documents on how to deploy node app.**

### What will this guide touch on?

-   How to create a Firebase project
-   How to deploy on Firebase project
-   Configure Firebase project for mocking using hard-coded data
-   How to add new APIs that mimic what you want
-   How to use Firestore database to provide mocked data
-   Troubleshooting — some known issues and their solution

### Setup & Deploy Firebase

First, go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and click on “Add Project” and name it to complete the project creation step.

![](https://cdn-images-1.medium.com/max/800/1*cNtjrmCpEk-WIaT12O7IqA.png)

Create project. Note: The project ID will be visible in URL used in mocking.

If you don’t have “**Firebase CLI**” installed, follow steps from [https://firebase.google.com/docs/cli/](https://firebase.google.com/docs/cli/) to install the Firebase CLI. This will allow you update code to deploy mock server to Firebase.

Run `**firebase projects:list**` command in terminal to validate the project you just created shows up in the list.

![](https://cdn-images-1.medium.com/max/800/1*tLq8Nb67WZaB8S4naHK4mQ.png)

Now, go to a new directory and initialize a new firebase project by running the following command:

```
firebase init
```

---

![](https://cdn-images-1.medium.com/max/1200/1*Xy89RPx9KAuBap0CXkypVg.png)

Select “Functions” and “Hosting” by going up and down and pressing space to turn on the option. Then press Enter. Note that “Hosting” is not required however, if you want to host mock image or video, you will need hosting.

---

Use default options for the `firebase init` wizard. We will update some configuration later. Once initialization is completed, link your newly created firebase project with current directory project by executing following command with your project ID you just created:

```
// “**your-project-id-23d6x**” is the ID from “firebase list” command.
```
```
firebase use --add your-project-id-23d6x
```

Now, try deploying barebone project to see everything is working by running `**firebase deploy**`. Once the project is deployed, you will see a public URL in the console (eg. [https://your-firebase-appid.firebaseapp.com/](https://devel-mock.firebaseapp.com/)) and use that to verify that default `index.html` content for Firebase is shown.

### Use Express for Mocking

Now that the default project is up and running, it’s time to setup Express so that we can define our API that mimics what we want.

First, update **rewrites** rule of `/firebase.json` to forward all requests to Firebase Cloud Function.

```
"rewrites": \[  
     {  
        "source": "\*\*",  
        "function": "api"        
     }  
\]
```

See [github-sample](https://github.com/amardeshbd/firebase-mock-api-server/blob/master/firebase.json#L17) for reference.

Now, update `/functions/package.json` file to include express and cors under `"dependencies"`.

```
"dependencies": {      
   "cors": "^2.8.5",     
   "express": "^4.16.4",  
   // .... more dependency here  
}
```

See [github-sample](https://github.com/amardeshbd/firebase-mock-api-server/blob/master/functions/package.json#L14) for reference.

Once this is done, you need to update `npm` modules so that Express can be used. Use the following commands to update it.

```
cd functions  
npm install  
cd ..
```

Now, you have express ready to be used in `/functions/index.js`. Open `**index.js**` and remove any previous content, and apply the following:

Now that `app` is an Express instance, you can start defining APIs using [routing rules](https://expressjs.com/en/guide/routing.html). Here is a simple example that provides the hard-coded response for `/say/hello` API.

NOTE: All the APIs must be added before “exports.api = …” line.

See [GitHub example](https://github.com/amardeshbd/firebase-mock-api-server/blob/master/functions/index.js) with HTTP ‘`get`’ & ‘`post`’ API with a dynamic response based on request data. The example also shows how you can load large data from JSON file, which keeps the “index.js” file clean from hard-coded data.

Once you are done adding APIs, you can run `**firebase deploy**` from root of the project to deploy your APIs.

> NOTE: If you are getting HTTP 500 error — You client does not have permission, then see troubleshooting section at the end of this article.

Here are some example APIs that are available from the [example](https://github.com/amardeshbd/firebase-mock-api-server) GitHub project.

-   [https://mock-apis-server.firebaseapp.com/say/hello?name=Ryan](https://mock-apis-server.firebaseapp.com/say/hello?name=Ryan)
-   [https://mock-apis-server.firebaseapp.com/photos/29647](https://mock-apis-server.firebaseapp.com/photos/29647)

### UPDATE#1: Use Firebase firestore database for mocked response

If you want to dynamically update content and don’t want to keep updating JSON file and re-deploy each time, then using Firestore is a perfect solution. Using firebase console you can update response data which will be immediately reflected on next request. You can also add/remove fields to simulate error handling.

To use Firestore, you need to enable database and create a collection(like table) to store data.

![](https://cdn-images-1.medium.com/max/800/1*bl4eShRt2PYb4OVcKNrtdg.png)

Here is an example, where “userProfiles” is a collection of user profile info.

Here is a partial example on how to access the data from the Firestore collection

Now, using the Firebase [console](https://console.firebase.google.com/), you can modify the contents and the next API request will reflect the new data.

Happy mocking 😃!

---

See [https://github.com/amardeshbd/firebase-mock-api-server](https://github.com/amardeshbd/firebase-mock-api-server) for more detailed example and sample APIs you can test from the browser.

[**amardeshbd/firebase-mock-api-server** — *A simple mock API server using expressjs that is hosted on firebase. - amardeshbd/firebase-mock-api-server*](https://github.com/amardeshbd/firebase-mock-api-server)

---

### Troubleshooting Guide

While following my guide later, I have encountered some issues that I did not see before. I am going to list them here, in case you are experiencing the same issue.

#### Firebase — Your client does not have permission to get URL from this server

![](https://cdn-images-1.medium.com/max/800/1*CibUHb-RRQnjiPL40iJPTQ.png)

Screenshot showcasing what it should look like after adding the \`allUsers\` role .

This can happen if your Firebase project does not have the right permission to allow any unauthenticated users from accessing the APIs. In that case, you need to add `allUsers` to “Cloud Function Invoker” role. That essentially allows anybody to access this API *(less secured obviously, but I assume this is only mock data and for testing only)*.

You can add that permission by going to [https://console.cloud.google.com/functions](https://console.cloud.google.com/functions) and selecting the project from the drop-down at the top bar (beside “Google Cloud Platform”).

Here is a screenshot showing how to add a new member role.

![](https://cdn-images-1.medium.com/max/800/1*trmuKmCY0RlVDJacEIVElQ.png)

On “Add Member” screen, select the following and click “Save”:

-   New members: `allUsers`
-   Role: `Cloud Functions` > `Cloud Functions Invoker`

Now, retry your API, it should succeed without any error 👍

#### Error: Refresh token must contain a “client\_secret” property.

This is something I recently got after adding some Firebase Firestore code in the cloud functions, I could not push code using `firebase deploy`. After some Googling, I was able to find a solution from [Github issues](https://github.com/firebase/firebase-tools/issues/1708#issuecomment-555174511) by Brandon

> After upgrading to Mac OS Catalina I encountered this issue. What resolved it for me was running the following commands:

```
firebase login  
// Or try following:  
export GOOGLE\_APPLICATION\_CREDENTIALS="<SERVICE\_ACCOUNT\_KEY\_JSON>"
```

For me, trying `firebase login` worked.

---

If you have followed the steps and feel some parts are broken or not explained properly, please do leave a comment. I will update the guide accordingly.
