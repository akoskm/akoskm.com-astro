---
title: "Upgrading from jBPM 6.1.0.Final to 6.2.0.Final"
publishedAt: "2015-06-26T13:04:24.000Z"
updatedAt: "2021-06-24T13:18:16.895Z"
description: "Breaking API and persistence changes when upgrading jBPM from 6.1.0.Final to 6.2.0.Final, including JPATaskLifeCycleEventListener."
brief: "jBPM seems to use semantic versioning, however, 6.2.0.Final brings some changes that aren't backward compatible with the 6.1.0.Final API and dependencies.\nEspecially if you're using persistence.\nAPI\npublic JPATaskLifeCycleEventListener()\n\nhas been ch..."
readTimeInMinutes: 1
tags: []
series: null
draft: false
---

jBPM seems to use semantic versioning, however, 6.2.0.Final brings some changes that aren't backward compatible with the 6.1.0.Final API and dependencies.
Especially if you're using persistence.

## API {#api}

```java
public JPATaskLifeCycleEventListener()
```

has been changed to:

```java
public JPATaskLifeCycleEventListener(boolean flag);
```

There is no documentation about this flag and it has no purpose in the [latest version](https://github.com/droolsjbpm/jbpm/blob/04dff973905d3c3cacd3c4e45a420fb3b48945e3/jbpm-human-task/jbpm-human-task-audit/src/main/java/org/jbpm/services/task/audit/JPATaskLifeCycleEventListener.java#L47).

## Dependencies {#dependencies}

If you were carefully adding only the *necessary* dependencies to your project, after fixing the compile-time errors you'll run into this:

```
java.lang.NoSuchMethodError: org.hibernate.cfg.Configuration.getNamingStrategyDelegator()Lorg/hibernate/cfg/naming/NamingStrategyDelegator;
  at org.hibernate.ejb.Ejb3Configuration.configure(Ejb3Configuration.java:1066)
  at org.hibernate.ejb.Ejb3Configuration.configure(Ejb3Configuration.java:295)
  at org.hibernate.ejb.Ejb3Configuration.configure(Ejb3Configuration.java:376)
  at org.hibernate.ejb.HibernatePersistence.createEntityManagerFactory(HibernatePersistence.java:58)
  at javax.persistence.Persistence.createEntityManagerFactory(Persistence.java:63)
```

Version 6.1.0.Final was happy with a single hibernate dependency:

```xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-core</artifactId>
  <version>4.2.3.Final</version>
</dependency>
```

while 6.2.0.Final requires two other dependencies:

```xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-entitymanager</artifactId>
  <version>4.3.7.Final</version>
</dependency>
<dependency>
  <groupId>org.hibernate.javax.persistence</groupId>
  <artifactId>hibernate-jpa-2.0-api</artifactId>
  <version>1.0.1.Final</version>
</dependency>
```

If there is something more what you can't find on the list, let me know and I'll add it.
