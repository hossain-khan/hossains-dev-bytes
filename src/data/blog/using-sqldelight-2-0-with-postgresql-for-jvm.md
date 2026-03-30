---
title: Using SQLDelight 2.0 with PostgreSQL for JVM
description: How to create data source to connect to PostgreSQL database and work with SQLDelight 2.0
pubDatetime: 2023-09-06T23:06:26.548Z
tags: ["kotlin", "postgresql", "database"]
featured: false
draft: false
---


Recently I wanted to do some experiments with saving JSON data into a database and found out that PostgreSQL supports JSON as a data type.

I also wanted to use the fantastic SQLDelight library that creates type-safe models and queries for any database (it’s also multi-platform supported).

While trying to follow the recently released SQLDelight 2.0 [guide](https://cashapp.github.io/sqldelight/2.0.0/jvm_postgresql/), I stumbled into missing pieces to make the PostgreSQL work with it.

In this post, I will try to fill in the gaps and build a sample project showcasing both working together ✌️

![](https://cdn-images-1.medium.com/max/800/1*-iwhQZDvHsrT8BHZDS_IVg.png)

PostgreSQL and SQLDelight. Source: [https://kinsta.com/](https://kinsta.com/)

---

A few of the missing pieces that I had to figure out were:

1.  Create `**DataSource**` (“hikari” or other connection managers were mentioned in the guide)
2.  Using `**HikariCP**` as data source to connect to PostgreSQL
3.  Write all the glue pieces to use the SQLDelight code to perform CRUD operations on the PostgreSQL Database

Use `HikariCP` to create PostgreSQL `DataSource`

First import the hikari and PostgreSQL library into your JVM project

```kotlin
// https://github.com/brettwooldridge/HikariCP#artifacts  
implementation("com.zaxxer:HikariCP:5.0.1")  
  
// This is needed for the PostgreSQL driver  
// https://mvnrepository.com/artifact/org.postgresql/postgresql  
implementation("org.postgresql:postgresql:42.6.0")
```

Then you need to build the `HikariConfig` with the right data set to connect to the database and then create the `HikariDataSource` which is what is needed for the SQLDelight

Here is a snippet taken from the [sample project](https://github.com/hossain-khan/SQLDelight-PostgreSQL-JVM-sample/blob/main/src/main/kotlin/dev/hossain/postgresqldelight/SportsRepository.kt)

```kotlin
private fun getDataSource(): DataSource {  
    val hikariConfig = HikariConfig()  
    // See https://jdbc.postgresql.org/documentation/use/  
    hikariConfig.setJdbcUrl("jdbc:postgresql://localhost:5432/dbname")  
    hikariConfig.driverClassName = "org.postgresql.Driver"  
    hikariConfig.username = "dbusername"  
    hikariConfig.password = "dbpassword"  
  
    return HikariDataSource(hikariConfig)  
}
```

That’s it, now you can follow the official SQLDelight guide on creating databse to create tables and do CRUD operations.

For example, here is a simplified snippet to give the whole picture

```kotlin
val dataSource: DataSource = getDataSource(appConfig)  
  
val driver: SqlDriver = dataSource.asJdbcDriver()  
  
// NOTE: The `SportsDatabase` and `PlayerQueries` are from SQLDelight  
val database = SportsDatabase(driver)  
val playerQueries: PlayerQueries = database.playerQueries  
  
val hockeyPlayers = playerQueries.selectAll().executeAsList()  
println("Existing ${hockeyPlayers.size} records: $hockeyPlayers")  
// Prints following 👇  
// - - - - - - - - - -  
// Existing 15 records:   
// [HockeyPlayer(player_number=10, full_name=Corey Perry), ... ]
```

The full snippet is available [here](https://github.com/hossain-khan/SQLDelight-PostgreSQL-JVM-sample/blob/main/src/main/kotlin/dev/hossain/postgresqldelight/SportsRepository.kt#L41-L53).

See the GitHub project for a complete example with gradle dependencies and SQLDelight configuration needed to make it work.

[**GitHub - hossain-khan/SQLDelight-PostgreSQL-JVM-sample: A sample project exercising PostgreSQL with SQLDelight** — *A sample project exercising PostgreSQL with SQLDelight 2.0 - GitHub - hossain-khan/SQLDelight-PostgreSQL-JVM-sample*](https://github.com/hossain-khan/SQLDelight-PostgreSQL-JVM-sample)

---

Happy to hear feedback or any corrections to do this in a better way.

> EDIT: After I wrote the article, I found similar article about it (which could have saved me ton of time), so do take a look at it too 😊

[**SQLDelight for PostgreSQL on Kotlin JVM** — *In simple terms, SQLDelight is a tool that takes your slightly modified SQL code and converts it to easy to use Kotlin…*](https://medium.com/@theendik00/sqldelight-for-postgresql-on-kotlin-jvm-b95d14d96134)
