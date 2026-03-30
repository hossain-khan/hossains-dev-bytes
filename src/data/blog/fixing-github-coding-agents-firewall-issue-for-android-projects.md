---
title: Fixing GitHub Coding Agent’s Firewall Issue for Android Projects
description: If GitHub coding agent is having issue downloading artifacts from different URL, consider adding them to allow list to fix those issues.
pubDatetime: 2025-08-03T04:19:23.335Z
tags: ["android", "github", "ai"]
featured: false
draft: false
---


![](https://cdn-images-1.medium.com/max/1200/1*slYJRhU6p-2mzC6QDAzCfw.jpeg)

---

Ever since [GitHub coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) is released, I have been big fan of async agentic work. I have been primarily working and Android projects and one of the issue constantly bothering me was the Gradle build issue.

Everyone agent goes off to work, it almost always encounters this issue:

```text
* What went wrong:  
Plugin [id: 'com.android.application', version: '8.12.0', apply: false] was not found in any of the following sources:  
  
- Gradle Core Plugins (plugin is not in 'org.gradle' namespace)  
- Included Builds (No included builds contain this plugin)  
- Plugin Repositories (could not resolve plugin artifact 'com.android.application:com.android.application.gradle.plugin:8.12.0')  
  Searched in the following repositories:  
    Google  
    MavenRepo  
    Gradle Central Plugin Repository  
  
BUILD FAILED in 29s
```

In the PR that is created by agent you will see something like:

```text
 <summary>Firewall rules blocked me from connecting to one or more addresses</summary>  
  
 #### I tried to connect to the following addresses, but was blocked by firewall rules:  
  
 - `developer.android.com`  
   - Triggering command: `curl -s REDACTED` (dns block)  
 - `dl.google.com`  
   - Triggering command: `/usr/lib/jvm/temurin-17-jdk-amd64/bin/java --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.lang.invoke=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.prefs/java.util.prefs=ALL-UNNAMED --add-exports=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED --add-exports=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.prefs/java.util.prefs=ALL-UNNAMED --add-opens=java.base/java.nio.charset=ALL-UNNAMED --add-opens=java.base/java.net=ALL-UNNAMED --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED --add-opens=java.xml/javax.xml.namespace=ALL-UNNAMED -Xmx2048m -Dfile.encoding=UTF-8 -Duser.country -Duser.language=en -Duser.variant -cp /home/REDACTED/.gradle/wrapper/dists/gradle-8.14.3-bin/cv11ve7ro1n3o1j4so8xd9n66/gradle-8.14.3/lib/gradle-daemon-main-8.14.3.jar -javaagent:/home/REDACTED/.gradle/wrapper/dists/gradle-8.14.3-bin/cv11ve7ro1n3o1j4so8xd9n66/gradle-8.14.3/lib/agents/gradle-instrumentation-agent-8.14.3.jar org.gradle.launcher.daemon.bootstrap.GradleDaemon 8.14.3` (dns block)  
  
 If you need me to access, download, or install something from one of these locations, you can either:  
  
 - Configure [Actions setup steps](https://gh.io/copilot/actions-setup-steps) to set up my environment, which run before the firewall is enabled  
 - Add the appropriate URLs or hosts to the custom allowlist in this repository's [Copilot coding agent settings](https://github.com/hossain-khan/android-compose-app-template/settings/copilot/coding_agent) (admins only)
```

Here is a preview of how it looks on your PR!

![](https://cdn-images-1.medium.com/max/800/1*B-8yyzSDg4FENfG9_2xSvw.png)

Preview when firewall blocks connection to Google’s maven repo

---

The fix is as simple as reading the warning with patience and **follow the link to agent settings** in the GitHub repo. Once you go to settings, you just have to add the domains you want to whitelist. Here is screenshot of those steps for reference.

![](https://cdn-images-1.medium.com/max/800/1*QdIAq7J0u7K8NoQcqNqpbA.png)

Go to Coding Agent settings and click “Custom allowlist”

![](https://cdn-images-1.medium.com/max/800/1*g7MXPNZlk-qtR4CHnL4yEg.png)

Finally add the domain that you want to whitelist / allow

That’s it, next time the agent runs, it should be able to continue with Gradle build system that depends on google maven repo or Gradle plugin artifacts that are hosted at Google domains.

**Related resources**

-   [https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-firewall](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-firewall)

**Domains**

Here are some of the domains I have added so far that caused issue earlier

-   `dl.google.com`
-   `jitpack.io`
-   `maven.google.com`
-   `plugins.gradle.org`
-   `repo.gradle.org`
-   `docs.oracle.com`
-   `kotlinlang.org`
-   `firebasecrashlyticssymbols.googleapis.com`
-   `firebaseinstallations.googleapis.com`
-   `firebase-settings.crashlytics.com`
-   `scans-in.gradle.com`
-   `googlechromelabs.github.io`
-   `storage.googleapis.com`
-   `api.github.com`
