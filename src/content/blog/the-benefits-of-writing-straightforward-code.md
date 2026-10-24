---
title: "The Benefits of Writing Straightforward Code: Production Experiences"
publishedAt: "2023-10-16T17:21:44.731Z"
description: "Optimize readability using concise syntax, self-explanatory code, and relevant comments; avoid complexity and focus on the problem"
brief: "One of the many reasons I enjoy leading a boutique software development agency is that it allows me to remain closely connected to the forefront of the craft.\nAlthough I don't see anything wrong with them, the idea of me moving to manager roles alway..."
readTimeInMinutes: 5
coverImage: "../../assets/posts/the-benefits-of-writing-straightforward-code/cover.png"
tags:
  - name: "TypeScript"
    slug: "typescript"
  - name: "Web Development"
    slug: "web-development"
  - name: "clean code"
    slug: "clean-code"
  - name: "coding"
    slug: "coding"
  - name: "code review"
    slug: "code-review"
series: null
draft: false
---

One of the many reasons I enjoy leading a boutique software development agency is that it allows me to remain closely connected to the forefront of the craft.

Although I don't see anything wrong with them, the idea of me moving to manager roles always meant a tradeoff. That is, losing the hands-on experience with coding.

Keeping my company small forces me to stay in the loop with tools, development, and everyone involved, clients and co-workers, equally.

We also use a lot of automation that saves us time - eslint, prettier, TypeScript, you name it - that helps us discover problems before they occur.

We use automated tests - both unit and end-to-end - to rigorously test our entire stack, especially the business critical parts.

But even with all this magic in place, you can deploy code smells without thorough code reviews.

# Automation doesn't solve everything {#heading-automation-doesnt-solve-everything}

The other week, I was looking at a Pull Request that adds multitenant support to a SaaS application we built for our client. It was a huge change, but I spotted something slightly off. Here's the code as it was in its original form.

Take a moment and examine it, and feel free to speak out loud the steps and understand what the function does:

```typescript
import { UserRegistration } from "@fusionauth/typescript-client";

const getUserRole = async (
  registrations: UserRegistration[],
  givenAppId: string,
) => {
  let role = "";

  registrations.forEach(({ applicationId, roles }: UserRegistration) => {
    if (applicationId === givenAppId && roles) {
      role = roles[0];
    }
  });

  return role;
};

export default getUserRole;
```

In my head, it sounded something like this:

1. for every `registration` in the `registrations` array, find the `registration` that has the same `applicationId` as `givenAppId`
    
2. and if this `registration` also has `roles`
    
3. take the first role of these roles and save it for the `role` variable.
    
4. proceed to the next `registration`
    

Or, you could sum up the entire thing like this:

Find the first role in `roles` for the last `registration` where the registration's `applicationId` is `givenAppId`.

# Consequences {#heading-consequences}

For the sake of this example, let's say you're familiar with FusionAuth, and you know that each registration has a different `applicationId`.

So, looking at the above algorithm, this would mean that suddenly, we have a structure like the following:

```typescript
const registrations = [{
  applicationId: '123abc',
  roles: ['admin', 'user']
}, {
  applicationId: '123abc',
  roles: ['user', 'guest'],
}]
```

But this kind of data structure wouldn't make much sense, right? You would either have all roles for a given `applicationId` under the same object, or the objects should have different `applicationId`s.

So I continued my search with the TypeScript definitions and later the documentation to see what has changed in the API because I just couldn't wrap my head around the idea of looking for the last `[role]`, why last is so important, and why there are more elements in the array with the same `applicationId`.

Well, it turns out there aren't.

# Do what you need to do and nothing more {#heading-do-what-you-need-to-do-and-nothing-more}

After failing to find answers to my questions, I left some comments on the Pull Request. As it turned out, there is always only one `registration` in the `registrations` array with a given `applicationId`.

## Lesson 1 - pick your tools {#heading-lesson-1-pick-your-tools}

Why is this so important for us from "a clear code perspective? Well, why walk through the entire array when you know there will be one occurrence of something?

If you have 1,000 app registrations, why look at the other 999 if the first registration is what you're looking for?

This turns the above `forEach` - which is made to traverse the entire array by calling a function ***for each*** element of it - into a ***find***:

```typescript

const currentAppRegistration = registrations.find(
  ({ applicationId }: UserRegistration) => applicationId === givenAppId,
);
```

`find` exits the loop after the first element is found and answers whether the data structure of our favorite Auth provider, FusionAuth, has changed - it didn't.

## Lesson 2 - use code comments {#heading-lesson-2-use-code-comments}

The code should be always self-explanatory. This can be achieved in different ways, but your most common tools are naming variables correctly and using the right structures to clear doubts about what needs to be done - see Lesson 1.

If none of these help, that's when you leave code comments, just as we did to make the rest of our `getUserRole` function clearer:

```typescript
/**
 * we grab the first role because
 * we have only one role for each registration
 */
if (currentAppRegistration?.roles)
  return currentAppRegistration.roles[0];

return "";
```

# Why it's important to write obvious code {#heading-why-its-important-to-write-obvious-code}

> There should be one-- and preferably only one --obvious way to do it.

This quote is from the [The Zen of Python](https://peps.python.org/pep-0020/#the-zen-of-python), one of my favorite lines. Being obvious is essential because going back and forth is time wasted.

And time wasted is someone else's money.

When doing self-reviews (reviewing my code before asking someone else's opinion, am I the only one?) I'm always looking for places where one would potentially ask - Why did you do this?

Because if they care, and if it's not evident from the code, they will ask.

You could ask

> *What if* *the data structure changes and the forEach eventually becomes relevant?*

Well, in that case, why not just throw in a couple more checks in case application roles can also be a planned string of roles, such as `"admin, user, guest"` and instead of accessing the 0-th element of the array, let's just do a `split(",")[0]`, *just in case*!

YAGNI (You aren't gonna need it) - another great principle from XP (extreme programming) that tells the programmer not to add excess functionality until necessary. Architecture and coding for future use cases only have a positive impact if you can predict the future with great accuracy. In that case, please send me an email. I have a few questions for you.

# Conclusion {#heading-conclusion}

We should strive to keep our code obvious, to solve the problem and only the problem at hand. Write code in a way that answers anything that can't be figured out from the context or the rest of the code, and don't try to foresee the future. Adding "just in case" code almost always ends up as "technical debt" - a considerable time (and money) pit for you and your clients.
