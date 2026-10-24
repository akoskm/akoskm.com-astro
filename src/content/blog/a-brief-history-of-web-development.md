---
title: "A Brief History of Web Development"
publishedAt: "2023-12-27T11:16:31.386Z"
description: "Taking a moment to appreciate where web development started for me and how amazing it is right now."
brief: "The most thrilling days of web development are happening now. We have access to the best tools, making website and web app development an unparalleled experience. Faster, more efficient solutions are being developed monthly, causing the entire field ..."
subtitle: "How we got to SPAs, RSC, Remix and why this is all important"
readTimeInMinutes: 6
coverImage: "../../assets/posts/a-brief-history-of-web-development/cover.png"
tags:
  - name: "Web Development"
    slug: "web-development"
  - name: "Remix"
    slug: "remix"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Career"
    slug: "career"
  - name: "Software Engineering"
    slug: "software-engineering"
series: null
draft: false
---

The most thrilling days of web development are happening now. We have access to the best tools, making website and web app development an unparalleled experience. Faster, more efficient solutions are being developed monthly, causing the entire field to evolve like there's no tomorrow.

But it hasn't always been like this.

About twenty years ago, when I made that first website for the kindergarten where my mother worked, the coolest thing was the [marquee](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee) effect – that I just recently learned has been deprecated. 💔

Meet Macromedia Dreamweaver, where web development started for me:

![Macromedia Dreamweaver 8 Free Download + Serial - Software Free ...](https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F1.bp.blogspot.com%2F-7r46Y581U-M%2FVMrwZL8LWfI%2FAAAAAAAAAF8%2FxS4KGhLVwgY%2Fs1600%2FDW8.png&f=1&nofb=1&ipt=618a622f48e4cbac24aa23c75fbd1c822e86c5ab18842d187218d966a1576fe3&ipo=images)

But once I figured I could not only drag and drop things on the canvas, but there's this HTML view, and some say there's even a PHP server somewhere that can manipulate and store data, there was no going back.

This is where my history of web development started.

# Request-response {#heading-request-response}

I considered PHP as an extension on top of HTML altough this wasn't completely true.

I could already create mindblowing static sites using the right amount of marquee (RIP 💔), but tapping into a data source on the server made me feel like Neo.

```php
<!DOCTYPE html>
<html>
  <body>
  <?php
    $sql = "SELECT username FROM users WHERE id = 1";
    $result = $conn->query($sql);
    echo "<h1>Welcome, " . $user_username . "!</h1>";
  ?>
  </body>
</html>
```

I'm not sure if this is how PHP looks today. Hashnode's AI code generator gave this to me, and it certainly looks like something I wrote!

Using this tech, I built my first SaaS right before the year I went to the university. It was a phpBB-like forum for our middle school. Using the same stack, I wrote an even bigger app used as a nationwide registration system for a national mathematical competition.

I didn't know what SaaS or being productive as a programmer meant back then because I just dabbled with these things.

15 years later, it's an absolute *yes*. HTML, CSS, PHP, and MySQL made me extremely productive. And I haven't used JavaScript at this time. I used maybe snippets I found on the internet, but I showed no interest in learning it because I didn't need it.

The apps I've built in those years mostly looked like current government websites:

![Website Forms Usability: Top 10 Recommendations (2023)](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.nngroup.com%2Fmedia%2Feditor%2F2016%2F04%2F22%2Ftsa-complaints-form-with-clear-button.png&f=1&nofb=1&ipt=18b20f469655cf20f48f04c65dc9467e657015402e3a915e99f93c88ef6436ae&ipo=images)

Remember clicking that submit button a couple of times?

# Ajax responses, the first spinners {#heading-ajax-responses-the-first-spinners}

It didn't take me long to realize the value of Ajax. Suddenly, I didn't need full page reloads to show dropdowns with different values or to disable a Submit button when the request was already processing.

Ajax improved the user experience by adding a slight cost to the maintenance.

At this time, most of my applications were still 99% PHP, HTML, and CSS. Fast forward 4 years to my graduation.

I learned a whole lot of Java at the university and continued selling websites as a side hustle until I landed my first developer job in January 2012.

JSF (Jakarta Server Faces) was popular then, and the company I worked for was bullish on enterprise Java.

*Looking at you, ReponseTaskServerAdapterPropertyObserverSetter.*

We built web apps that looked like desktop apps, which were incredibly painful to develop, deploy, and maintain.

They looked like this:

![Código Fonte Blvendasee 1.0 Java Para Web Jsf Primefaces Jpa - R$ 89,00 ...](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fhttp2.mlstatic.com%2Fcodigo-fonte-blvendasee-10-java-para-web-jsf-primefaces-jpa-D_NQ_NP_190711-MLB20611825800_032016-F.jpg&f=1&nofb=1&ipt=1446159274d8f57ded8915374d6d05a7404ff27d1edc7c1041ee3b455e8fc195&ipo=images)

JSF wanted to be a silver bullet; we didn't use much pure HTML because JSF libraries had components for buttons, inputs, autocompletes, etc. But it was a world full of promises and a horrifying development experience.

# The SPA revolution {#heading-the-spa-revolution}

SPAs came like a savior.

![](https://i.imgflip.com/8a00ug.jpg)

Once we realized we could expose REST APIs on the server and write our entire client in JavaScript, our productivity reached HTML, CSS, and PHP levels again.

The client apps resembled what you would have today in a React application.

```html
// bundle.js
var message = new Message();
var messageView = new MessageView({ model: message });

$('#root').append(messageView.render().el);

// index.html
<html lang="en">
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

A nothingburger and a client app packed into a ginormous `bundle.js` file.

The bundle got to the client, but it had to fetch some data to render the app first.

And this is when our apps started to have more of these:

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://media.giphy.com/media/y1ZBcOGOOtlpC/giphy.gif">https://media.giphy.com/media/y1ZBcOGOOtlpC/giphy.gif</a></div>

# The Spinner Hell {#heading-the-spinner-hell}

But it was not just the spinners. This client-rendering behavior introduced a whole lot of other issues, like layout shifts:

[https://web.dev/static/articles/cls/video/web-dev-assets/layout-instability-api/layout-instability2.webm](https://web.dev/static/articles/cls/video/web-dev-assets/layout-instability-api/layout-instability2.webm)

The bundle sizes got out of control unless you were really, really careful. You could have gzipped a date library that added 50kB to your bundle size when you could have converted the timestamp from the db into a human-readable format before sending the response!

Websites felt slower, but the spinner kept spinning, giving us some hope.

# RSC, Remix {#heading-rsc-remix}

Up until now, we simply didn't have better ways to deal with this problem other than maybe using UI skeletons. They weren't a perfect solution either, and they looked weird when they got out of sync with the rest of the app.

![How to Build a Skeleton Layout in React - DEV Community](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fres.cloudinary.com%2Fpracticaldev%2Fimage%2Ffetch%2Fs--RKvEPLBS--%2Fc_limit%252Cf_auto%252Cfl_progressive%252Cq_auto%252Cw_880%2Fhttps%3A%2F%2Fmiro.medium.com%2Fmax%2F1400%2F0*s7uxK77a0FY43NLe.png&f=1&nofb=1&ipt=76f61e98127a0efa8f16576188ebeb45e9546bde7311e58e2ca7633fc6e4c9c2&ipo=images)

React Server Components are an idea to tackle this problem with an initial implementation, but not much acceptance from the community yet.

[Ryan Florence](https://hashnode.com/@ryanflorence) wrote an excellent blog post about the key differences, both in theory and in practice, between RSC and Remix in [React Server Components and Remix](https://remix.run/blog/react-server-components).

To sum up, React Server Components follow the *Render-Fetch* waterfall. This means the component gets rendered first and then it fires a fetch.

In contrast, Remix uses the *Fetch, Then Render* waterfall, which is closer in behavior to what we had before the spinner armageddon.

Remix's loader does all the fetches, and when they're ready, only the result (component populated with the result of the loader) is returned to the browser.

Remix acts like an SPA on subsequent navigations and fetches only the necessary data to show the view.

See what happens after I switch between `/me` and `/settings`:

![](/assets/posts/a-brief-history-of-web-development/09903077-9d72-4460-b86e-32cbdd3ad7af.gif)

Hitting `/me` for the first time, retrieves the simple HTML page already pre-populated with the data – no need for loading spinners.

Kind of like in:

```php
<!DOCTYPE html>
<html>
  <body>
  <?php
    $sql = "SELECT username FROM users WHERE id = 1";
    $result = $conn->query($sql);
    echo "<h1>Welcome, " . $user_username . "!</h1>";
  ?>
  </body>
</html>
```

But switching back and forth between the `/settings` and the `/me` page fetches only what's necessary – a JSON containing the data needed to display `/me`.

# Why this changes everything {#heading-why-this-changes-everything}

Instead of going with the overused "Next.js is PHP now" memes, I want you to think about where it all started and how far we've come.

This is an evolution.

It's all about constantly changing, trying new things, keeping what worked, and leaving behind what didn't.

From marquee 💔, PHP/HTML/CSS, to JSF, and the painfully slow deployment times that made web development with Java an absolute nightmare, back to a much simpler render request-response cycle.

Today, we can pick from the best tools the industry offers.

They all provide a lot better development experience than I could have imagined 20 or 10 years ago.

Congrats to the Next.js and the Remix teams for their fantastic job and community support.

I hope the React team will finalize the RSC Next year and everyone can use it to their fullest potential to build even better apps.
