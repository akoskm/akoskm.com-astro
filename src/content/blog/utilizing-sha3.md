---
title: "Utilizing SHA3"
publishedAt: "2013-08-18T13:04:44.000Z"
updatedAt: "2021-06-24T13:10:36.433Z"
description: "Notes from rewriting access-token generation: UUID pitfalls, collision risks in MD5 and SHA-1, and switching the hash to SHA-3."
brief: "Why bother?\nDuring the past week, I was busy improving our token generation techniques. It ended up in a complete rewrite of our access token generation mechanism. Long story short, a few things to keep in mind when working with security:\n\nUUID\nUUID ..."
readTimeInMinutes: 3
tags:
  - name: "Java"
    slug: "java"
  - name: "Security"
    slug: "security"
  - name: "Cryptography"
    slug: "cryptography"
series: null
draft: false
---

## Why bother? {#why-bother}

During the past week, I was busy improving our token generation techniques. It ended up in a complete rewrite of our access token generation mechanism. Long story short, a few things to keep in mind when working with security:

- UUID

  UUID can hurt (see the standard, [6. Security Considerations](http://www.ietf.org/rfc/rfc4122.txt))
- MD5, SHA1

  theoretical collision attacks are possible ("within the realm of computational possibility") for both algorithms. Thanks [integricho](https://github.com/integricho) for sharing [this](http://www.pythonsecurity.org/wiki/django/#authentication) resource.
- SHA-2

  Designed by NSA (beware, this is NOT the company behind the [NSA Panel](https://github.com/goshakkk/nsa_panel) project). Collision-free, widely used, *pick up this one if you're already bored with my article*.
- [SHA-3](http://en.wikipedia.org/wiki/SHA-3)

  The winner of the 2012 [NIST hash function competition](http://en.wikipedia.org/wiki/NIST_hash_function_competition), isn't derived from SHA-2.

It's relatively easy to set up a pre-SHA-3 algorithm (SO, tutorials, and a small amount of effort). Sadly the most popular crypto libraries providing SHA-3 implementation have almost no usable resources (at the time of writing this article). There are dozens of independent implementations of the SHA-3 algorithm, but you probably just don't have enough time to go through them and check their validity.

## Show me the code, I'm in a hurry {#show-me-the-code-im-in-a-hurry}

The complete demo project can be found at [https://github.com/akoskm/bouncy-castle-sha3](https://github.com/akoskm/bouncy-castle-sha3).

I decided to go with [Bouncy Castle](http://www.bouncycastle.org), the library known for providing cryptographic API (includes SHA3 from version 1.48) for Java and C#.
`org.bouncycastle.jcajce.provider.digest.SHA3.DigestSHA3` gives you a `DigestSHA3` instance, subclassing [MessageDigest](http://docs.oracle.com/javase/7/docs/api/java/security/MessageDigest.html), which later can be used like:

```java
  DigestSHA3 md = new DigestSHA3(256); //same as DigestSHA3 md = new SHA3.Digest256();
  md.update("secret".getBytes("UTF-8"));
  byte[] digest = md.digest();
```

There are other constructors like `Digest384`, `Digest256`, ... providing you a digest of different sizes (I tend to avoid such constructors in practice and use factory methods or function arguments to set a custom size).

## The catch {#the-catch}

Once you get the `byte[]` you're almost done, the input is encrypted and the output is ready to use. Almost.

You probably want to store this hash in your DB or send it to your clients' browser, etc ..., so it would be nice if you could convert these bytes into String.

One thing, **don't do this**:

```java
  BigInteger bigInt = new BigInteger(1, digest);
  return bigInt.toString(16);
```

I prepared some [unit tests](https://github.com/akoskm/bouncy-castle-sha3/tree/master/src/test/java/io/github/bouncycastlesha3) to demonstrate the catch here. I used the example results from [SHA-3](http://en.wikipedia.org/wiki/SHA-3) (bottom of the page), almost all of them passed, except the *Keccak-512* with the empty string. During the conversion, it lost the leading 0, and instead of

```
    0eab42d...
```

I got

```
    eab42de...
```

## The solution {#the-solution}

Obviously, the conversion didn't work very well (if you know the exact reason, feel free to leave a comment below). Fortunately, Bouncy Castle already has a utility method that converts `byte []` to `String`:

```java
    org.bouncycastle.util.encoders.Hex.toHexString(byte [] data)
```

Your SHA-3 hash has been served, use it for the greater good!
