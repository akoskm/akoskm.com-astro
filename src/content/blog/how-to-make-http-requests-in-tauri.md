---
title: "How To Make HTTP Requests from Tauri"
publishedAt: "2024-03-10T17:58:06.970Z"
description: "Learn to add HTTP requests in Tauri apps with Vite and React - a simple guide for desktop app development with HTTP support"
brief: "Hey there, tech enthusiasts! 🌟\nWelcome back to my blog, where we demystify coding one step at a time.\nToday's journey dives into the exciting world of desktop app development using Vite, React, and Tauri. But here's the twist – we're adding HTTP sup..."
readTimeInMinutes: 3
coverImage: "../../assets/posts/how-to-make-http-requests-in-tauri/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "vite"
    slug: "vite"
  - name: "Tauri"
    slug: "tauri"
  - name: "http"
    slug: "http"
  - name: "desktop apps"
    slug: "desktop-apps"
  - name: "TypeScript"
    slug: "typescript"
  - name: "Beginner Developers"
    slug: "beginners"
series: null
draft: false
---

Hey there, tech enthusiasts! 🌟

Welcome back to my blog, where we demystify coding one step at a time.

Today's journey dives into the exciting world of desktop app development using Vite, React, and Tauri. But here's the twist – we're adding HTTP support to elevate your apps!

Sounds thrilling, doesn't it?

Let's get into it.

## Making HTTP Calls a Breeze 🌬️💻 {#heading-making-http-calls-a-breeze}

In our [previous adventure](https://youtu.be/XmTdvx4xM6I?si=PxEFufhZ6NARZOHI), you learned how to scaffold a React application with Vite and transform it into a desktop app.

This time, we're stepping up our game by integrating HTTP support. This means your desktop apps can now communicate with remote servers!

The best part?

It's surprisingly simple. You just need *one* package.

Install it via npm as a development dependency using the command:

```bash
npm install -D @tauri-apps/api
```

## Configuration is Key 🔑 {#heading-configuration-is-key}

Now, onto some configurations.

In your `src/tauri` folder, there's a little tweak to make in the Tauri configuration file. You'll be modifying the allowlist settings.

Essentially, you're telling Tauri to permit HTTP and HTTPS requests to specific domain domains. It's crucial for enabling your desktop application to access specified APIs. You can start with HTTP to localhost for testing, but there's the final configuration.

```typescript
// src-tauri/tauri.conf.json
{
 //..
  "tauri": {
    "allowlist": {
      "http": {
        "all": true,
        "request": true,
        "scope": [
          "http://localhost/*",
          "https://something.else/*",
          "https://hacker-news.firebaseio.com/*"
        ]
      }
    },
  }
  // ...
}
```

## Crafting the HTTP Call 🖥️📡 {#heading-crafting-the-http-call}

It's coding time!

In your `App.tsx` file, create a handle function linked to the UI button. This function will be responsible for making the HTTP call.

You'll need to import a couple of things from the Tauri apps API package, mainly the `fetch` and `ResponseType`.

The process involves defining the API URL (using Hacker News API here) and setting fetch options, like the response type to JSON.

```typescript
import { fetch, ResponseType } from "@tauri-apps/api/http";

function App() {
  const API_URL =
    "https://hacker-news.firebaseio.com/v0/item/8863.json?print=pretty";

  async function handleClick() {
    const response = await fetch(API_URL, {
      method: "GET",
      timeout: 30, //seconds
      responseType: ResponseType.JSON,
    });
    console.log(response);
  }

  return (
    <button onClick={handleClick}>Fetch</button>  
  );
}

export default App;
```

## Common Pitfalls & Solutions 🕳️🛠️ {#heading-common-pitfalls-amp-solutions}

Here's a heads-up: a common issue arises when trying to fetch from Tauri for the first time. If you start your app in development mode with `npm run dev` and attempt a fetch, you might run into an 'undefined function' error. The solution?

Use `npx tauri dev` instead.

It launches your app in a Tauri window, essential for the API to work correctly.

## The Moment of Truth: Running Your App 🚀 {#heading-the-moment-of-truth-running-your-app}

Once you've got all the settings in place, it's showtime! Run your application with `npx tauri dev`, and watch your HTTP request come to life!

You'll be able to see the data fetched from the API in the Browser console, be it a news item title or any other information you're retrieving!

## What's Next? 🤔 {#heading-whats-next}

There you have it – a step-by-step guide to adding HTTP support to your Tauri desktop application. It's a game-changer in the realm of desktop app development, unlocking a world of possibilities.

But wait, there's more! If you found this intriguing, don't forget to check out the full video on YouTube for a more in-depth walkthrough. And while you're at it, why not subscribe for more tech insights? 🎥👍

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://youtu.be/aW_blxdHqeY?si=bFRDQeamGm4c0Tpg">https://youtu.be/aW_blxdHqeY?si=bFRDQeamGm4c0Tpg</a></div>

### I Want to Hear from You! 💬 {#heading-i-want-to-hear-from-you}

What do you think about integrating HTTP support in desktop applications?

Have you tried it before, or are you planning to?

Share your thoughts, questions, or experiences in the comments below. Let's keep the conversation going! 💻❤️

Happy coding! 🌟👩‍💻👨‍💻
