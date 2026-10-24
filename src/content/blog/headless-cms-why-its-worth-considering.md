---
title: "Headless CMS: Why It's Worth Considering"
publishedAt: "2023-05-23T07:33:06.056Z"
updatedAt: "2023-05-31T04:17:17.107Z"
description: "Headless CMS boosts web development with client autonomy, quicker load times, and easy integration with frameworks like Next.js and Strapi"
brief: "It was around 2003 when I discovered Dreamweaver, and it changed web development for me forever.\nIn 2005-2006 I successfully sold two websites based on the famous Joomla, a Content Management System (or CMS for short) written in PHP.\nHaving a CMS was..."
subtitle: "Make money the same way web developers did twenty years ago"
readTimeInMinutes: 4
coverImage: "../../assets/posts/headless-cms-why-its-worth-considering/cover.png"
tags:
  - name: "Web Development"
    slug: "web-development"
  - name: "JavaScript"
    slug: "javascript"
  - name: "JAMstack"
    slug: "jamstack"
  - name: "Strapi"
    slug: "strapi"
  - name: "cms"
    slug: "cms"
series: null
draft: false
---

It was around 2003 when I discovered Dreamweaver, and it changed web development for me forever.

[In 2005-2006](https://akoskm.com/how-i-became-a-web-developer#heading-php-more-side-hustles-university) I successfully sold two websites based on the famous Joomla, a Content Management System (or CMS for short) written in PHP.

Having a CMS was essential in closing my first sales for one reason: business people could work on the content without my assistance.

However, there was another advantage to using a CMS from a development perspective: less code. More specifically, less code that you have to maintain. Solutions, such as Joomla, are maintained by its community, so you'll always have access to the latest and greatest version of the CMS with virtually no effort.

There's a security vulnerability in the core? It was fixed overnight by a guy named Andreas from Berlin, a talented developer with a passion for Joomla! Excellent!

So, after 20 years, guess what I'm experimenting with again? CMS system. Yup!

# Why use a CMS? {#heading-why-use-a-cms}

I want to build a productized solution with my web development agency [Innotek](https://innotek.hu/).

A CMS is at the heart of every company website and every solution that serves any kind of static content.

As mentioned earlier, the best thing about CMS systems is that they don't require as much assistance from developers as other solutions. I don't want to say they don't need any assistance at all. That's not entirely accurate, particularly in the beginning.

After delivering your solution to the client, their copywriter and marketing team can begin populating the site with content, requiring no further action from you.

This allows you to focus on other projects as the client populates their site with content while providing the client with confidence that they can operate without your constant support.

There are different approaches to implementing CMS solutions. There are traditional CMS solutions (Joomla, [WordPress](https://capitaloneshopping.com/s/wordpress.com/coupon)), Decoupled, and Headless CMS solutions. To learn more about the differences between these three, check out this blog post: [Headless CMS explained - an unbiased opinion](https://skyward.digital/blog/headless-cms-explained-an-unbiased-opinion).

I'm going to focus in this post on Headless CMS solutions because, in my opinion, today, it doesn't make much sense to go with the other two.

# What is a Headless CMS {#heading-what-is-a-headless-cms}

A Headless CMS is part of an architectural approach called JAMStack.

JAMStack has an unfortunate [definition](https://jamstack.org/glossary/jamstack/) on their website that might sound good for business folks, but for us ordinary developers, it's a bunch of mumbo-jumbo.

When I first read it, I asked: so, they're basically like any other web app, right?

J and A stand for JavaScript and API. Duh... You wouldn't have guessed, right?

The key is in **M,** which stands for Markup.

The JAMStack philosophy is essentially about prerendering as much stuff as possible at *build time* and serving static pages to the client.

This results in, you've guessed correctly, incredibly fast page load times because you're essentially looking at static HTML/CSS.

# Why not simply use site generators? {#heading-why-not-simply-use-site-generators}

Can't we do the same thing with site generators already? Such as Jekyll, Hugo, or simply Next.js. You can. You're also not going to sell any of that stuff to business people.

My second client, who bought my Joomla site, was selling decorations for birthday parties.

When she asked how the pages can be updated when new ballons arrive, I simply showed her where she needs to click in Joomla admin. The WYSIWYG editor was basically like working with Microsoft Word, which she was familiar with.

If I had to tell her to update the site by first checking out the git repo on her machine and then updating balloons.tsx, I would have left the demo empty-handed.

# Which Headless CMS Should You Choose? {#heading-which-headless-cms-should-you-choose}

My choice, for now, has been Strapi because it has the most GitHub stars from the modern JavaScript CMS system, which is obviously one of the most important metrics when picking a framework. Just kidding, of course.

I'm still experimenting but willing to invest more development time if it leads to a superior end-user experience for the client. After all, that's ultimately what we aim to provide.

If you're looking to sell such solutions to clients, the admin panel, permissions, the editor, and the content publishing flow are typically the key factors you'll base your decision on. If you want to read a detailed comparison between Strapi and Directus (I'm looking at these two at the moment), check out this blog post from [Restack](https://www.restack.io/docs/directus-vs-strapi).

# What's next? {#heading-whats-next}

I'm writing a series on implementing a Headless CMS solution as the backbone of my agency's website.

The CMS I'm going to use will most probably be Strapi. They have a great community and also a partner program, lots of use cases, tutorials, and videos.

For the front end, I will use Next.js because Server Component will play perfectly with the data that will come from Strapi at build time, so we can build those blazing-fast static pages.

Give this post a Hike and Hit follow if you'd like to see how I build all this.

Thanks for reading my blog!

\- Akos
