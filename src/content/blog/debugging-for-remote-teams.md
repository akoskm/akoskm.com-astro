---
title: "Debugging for Remote Teams"
publishedAt: "2023-03-11T15:50:50.139Z"
updatedAt: "2023-03-25T19:36:38.739Z"
description: "Learn how to debug effectively in remote teams with guidelines for asynchronous work, issue templates, pull request templates, and minimizing calls"
brief: "In 2015, I quit the company that offered me my first software developer job.\nThe same year I began my remote freelancer journey.\nAfter seven years, I’m proud to still work with one of my first freelancing clients.\nThere are a couple of reasons why we..."
subtitle: "Our practices that make debugging in a remote environment great"
readTimeInMinutes: 6
coverImage: "../../assets/posts/debugging-for-remote-teams/cover.png"
tags:
  - name: "DebuggingFeb"
    slug: "debuggingfeb"
  - name: "remote work"
    slug: "remote-work"
  - name: "Web Development"
    slug: "web-development"
  - name: "Pull Requests"
    slug: "pull-requests"
  - name: "Freelancing"
    slug: "freelancing"
series: null
draft: false
---

In 2015, I quit the company that offered me my first software developer job.

The same year I began my remote freelancer journey.

After seven years, I’m proud to still work with one of my first freelancing clients.

There are a couple of reasons why we've been working together for soo long. One is being efficient at async remote work.

<div class="hn-embed-widget" id="substack"></div>

This post doesn't focus on the technical aspects of debugging but on the practices and guidelines we use to speed up debugging and our entire remote and async workflow.

## The difference between async and remote work {#heading-the-difference-between-async-and-remote-work}

I’m running a small (literally two people) software development agency. We have worked remotely from the start, but not async!

We're in the same time zone and usually work around the same hours. So if there’s a need for a pair programming session, we can do that comfortably during work hours.

This is especially helpful if you work with developers who just started practicing this craft and need direction or help more often than their senior colleagues.

### Favoring async work {#heading-favoring-async-work}

Because we work with clients and developers from the US, sometimes there is little to no overlap between our working hours.

So while I'm starting my day in the EU, Josh is about to go to bed in San Francisco. Whatever I write to him in my morning, he'll look at it 10-12 hours later. This is async work.

To make this collaboration smooth, we established some guidelines for debugging, reporting issues, or working with the codebase.

## Provide context and a reproducible example {#heading-provide-context-and-a-reproducible-example}

There’s nothing worse than waking up to a GitHub issue with a single-line description:

”This doesn’t work on my machine.”

Then immediately replying, what exactly doesn’t work with this feature or workflow?

How did you get into this situation? Which browser were you using? Does this happen in staging or on the development branch? I could go on.

You are then waiting another working day to get the answers to these questions before you can get to the actual work.

### **Issue templates** {#heading-issue-templates}

[GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) in public repositories are great examples of how a bug report should look if your team is async - like most teams are on GitHub.

A well-written issue can significantly reduce the time spent searching for and eliminating the problem.

Don't overengineer your first template. A simple, 4-step questionnaire can massively improve your workflow:

1. Where did this bug occur (dev/staging/prod)?
    
2. What are the steps to reproduce this bug?
    
3. What did you expect?
    
4. What happened instead?
    

Once you have a great starting template, you can extend it later: specify your environment, operating system, etc.

Most of our projects are also on GitHub, and their interface lets you drag and drop a QuickTime video right into the issue description.

Screen recordings can be super helpful when debugging problems async.

But issue templates are handy when something is already broken, and the bug is already present.

So we use them with PR templates to further reduce debugging time - because a bug prevented, reduced time needed to debug, right?

## Create an actionable Pull Request {#heading-create-an-actionable-pull-request}

We already know that context switching is expensive.

Do you know what’s more expensive? Context switching with no reason.

Just as it feels wrong to open an issue with ”this doesn’t work,” it feels just as bad to open a PR assigned for you to review, while it has some obvious shortcomings.

Imagine someone finishing their work and finding time to review *your work*, only to finish it seconds later because you didn’t include tests in your PR.

We realized that our GitHub Pull Requests need to be actionable to prevent reviewers from wasting time pointing out minor issues.

To help create Actionable Pull Requests, we use GitHub Pull Request (PR) templates.

### A template for efficient code review {#heading-a-template-for-efficient-code-review}

PR templates are essentially debugging before bugs happen. It’s proofreading your code before we can discuss its correctness.

But it’s simpler if I show it to you.

Here’s one such template from one of our repositories:

```markdown
## Describe your changes

## Issue ticket number or link
 
## Checklist before requesting a review
 - [ ] I included tests
 - [ ] I self-reviewed the code
 - [ ] I checked the Files changed tab for unnecessary changes and removed them

## Migrations
 - [ ] There are no migrations in this PR
 - [ ] If there's a migration I tested the:
   - [ ] Up script
   - [ ] Down script
```

This PR template is a great reminder to ensure that before I ping someone to look at my work, I did the bare minimum that makes this PR worthy of eventually being merged.

Before we utilized PR templates, developers rejected PRs with comments such as: ”Add tests”.

You might argue, but you could still look at the rest of the PR.

The problem is that if you’re not doing TDD, you might change the implementation once you add the test.

## Use calls for debugging as a last resort {#heading-use-calls-for-debugging-as-a-last-resort}

Do calls sparingly and only when there’s nothing else you can do.

But even in those cases, we follow a specific *ritual* with clients and remote developers before we schedule a call.

If you ask someone to do a debugging session with you, make sure you're not

* late
    
* checking out the correct branch, installing dependencies in front of them
    
* just trying to find out where the page is where the bug happens
    

Before you ask another developer or the client to join your call, ensure you prepare everything.

After giving the necessary context, you should be able to start walking through the ”Steps to reproduce” part of the bug report and show them exactly what’s happening.

Why do we take this soo seriously?

Calls are expensive because they block people.

So every time you go into a call, one of your meta-goal should be blocking the other person as little as possible.

## Conclusion {#heading-conclusion}

Without guidelines, any work can become sloppy. But remote work, especially.

This is why utilizing the existing tools to establish orders in a remote and asynchronous setting is crucial.

We saw how things simple as a template could cut down the time needed to find a bug or prevent it from happening by setting more rigorous standards for pull requests.

We also discussed the cost of context switches and why we consider face-to-face calls expensive in development. But if they're inevitable, we know how to come as prepared as possible.

Good preparation is half success.

---

As always, thank you for gifting your precious time to this blog and reading my stories.

You can always contact me at hello@akoskm.com.

See you in the next one

\- Akos
