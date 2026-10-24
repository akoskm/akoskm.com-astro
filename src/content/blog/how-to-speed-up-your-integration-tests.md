---
title: "How to speed up your integration tests"
publishedAt: "2023-02-08T20:56:49.399Z"
updatedAt: "2023-06-14T10:08:24.160Z"
description: "In this post, I'll show you how we speed up the build process for one of our clients. Now they can run 40% more builds on the same budget."
brief: "In this post, I'll show you how we speed up the build process for one of our clients. Now they can run 40% more builds on the same budget.\nI must admit I’m a huge fan of unit tests. Some of my early blog posts are about unit testing.\nUnit tests are f..."
subtitle: "And delete some code in the process"
readTimeInMinutes: 4
coverImage: "../../assets/posts/how-to-speed-up-your-integration-tests/cover.png"
tags:
  - name: "Testing"
    slug: "testing"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Cypress"
    slug: "cypress"
  - name: "CI/CD"
    slug: "cicd"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
---

In this post, I'll show you how we speed up the build process for one of our clients. Now they can run 40% more builds on the same budget.

I must admit I’m a huge fan of unit tests. Some of my early blog posts are about unit testing.

Unit tests are fast, predictable, and… isolated.

They are nicely isolated in a sandbox, and that’s what makes them predictable and fast.

And that’s how we rolled out a release where the user couldn’t get to the login page, but that’s a story for another time.

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://media.giphy.com/media/6zvDSUtuMqp3O/giphy.gif">https://media.giphy.com/media/6zvDSUtuMqp3O/giphy.gif</a></div>

I'll title it ”The project without a single integration test and dozens of unit tests”.

To me, this never gets old:

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://twitter.com/rauchg/status/807626710350839808">https://twitter.com/rauchg/status/807626710350839808</a></div>

”Write tests. Not too many. Mostly integration.“- [tweeted](https://twitter.com/rauchg/status/807626710350839808) the CEO of Vercel [**Guillermo Rauch**](https://twitter.com/rauchg).

It’s not that I stopped writing unit tests entirely, but I’m using them sparingly. Mostly for functionality that can be safely tested in isolation, for example, a function that accepts a wide variety of inputs and returns a wide range of outputs.

Testing a matrix of possible values with an integration test wouldn’t be worth it.

Imagine having a calendar component where the user can type a date, select data from a dropdown calendar, and click a button to get a suggested date.

And all dates can be in different formats, depending on how the user inputs them.

Is it worth having an integration test for each possible date format?

Probably not!

However, you know that we send the entered date to a utility function responsible for interpreting many different formats of input dates, but it always returns a `Date` object.

Writing a unit test for this utility function would be a great idea!

Do you know what would also be a great idea? Subscribing to my newsletter! You can get my ideas into your inbox on a very irregular schedule. I can only promise that I don't spam, and whatever I send you will be useful. 😁

<div class="hn-embed-widget" id="substack"></div>

For the entire application, not so much.

Here’s why.

Let’s say you’re building an issue tracker.

You have an integration test that opens a dialog and tries to save a milestone without specifying a name. This will cause an error.

Your other test attempts to create a milestone, but now with a name specified. This won't cause an error and displays the message” New milestone saved”.

```typescript
beforeEach(async () => {
  await createNewProject();
});

it('cannot create milestone without a name', () => {
  clickNewMilestoneButton();
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'Milestone name is required');
});

it('creates a milestone', () => {
  clickNewMilestoneButton();
  newMilestonDialog.getNameField().type('February Milestone');
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'New milestone saved');
});
```

Nothing wrong with the above test at first sight.

However, creating a new project from scratch involves setting a name, filling out some start/end date, typing a description, selecting a project owner from a dropdown, giving the project the same labels, and filling in a couple of other fields.

Our test runner (I’m using Cypress now) will have to click through all these fields, type some stuff, wait for some suggestions to appear, then click, and then wait again.

![](https://i.imgflip.com/7agc1l.jpg)

Or putting numbers on the blocks, imagine it like this:

```typescript
beforeEach(async () => {
  // runs for 10 seconds
  await createNewProject();
});

it('cannot create milestone without a name', () => {
  // runs for 2 seconds
  clickNewMilestoneButton();
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'Milestone name is required');
});

it('creates a milestone', () => {
  // runs for 3 seconds
  clickNewMilestoneButton();
  newMilestonDialog.getNameField().type('February Milestone');
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'New milestone saved');
});
```

The entire test suit runs for 25 (2x10 + 2 +3) seconds, but the things we’re interested in only take up 5 seconds from this (2 + 3).

So can we do better?

Because both of these actions are happening inside the same `newMilestonDialog` we could argue that simply before filling the dialog with a name, we should attempt saving without a name first.

Our test would look like this:

```typescript
it('creates a milestone', () => {
  // runs for 10 seconds
  await createNewProject();

  // runs for 2 seconds
  clickNewMilestoneButton();
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'Milestone name is required');

  // runs for 3 seconds
  clickNewMilestoneButton();
  newMilestonDialog.getNameField().type('February Milestone');
  newMilestoneDialog.clickSave();
  newMilestoneDialog.should('have.text', 'New milestone saved');
});
```

Now the entire test suite will finish in only 15 seconds. That’s a speed increase of 40%!

I also remove the `beforeEach` because I find it an unnecessary mental overload when you have only a single `it` inside a `describe` block.

We’re still testing the same functionality, but we acknowledge the fact that the level of isolation that we initially created doesn’t worth the CI time, and we can test both the error message and the successful save with the same confidence as before, with 60% of the CI time.

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/555d0ff2-6bca-46cb-a268-fb54878f45d7/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20230208%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230208T200009Z&X-Amz-Expires=86400&X-Amz-Signature=b921ec82b494664ec3a5d9a15800ebcb3c5cc55448fd12894b1d22e2d148ccb5&X-Amz-SignedHeaders=host&response-content-disposition=filename%3D%22Untitled.png%22&x-id=GetObject)

In our real-world scenario, changes like these across the app heavily impacted our build performance.

We could get the CI time from 11-17 minutes into the sub-9-minute build time.

We run this project in limited CI minutes, so a 40% speed increase means we can run 40% more builds for our client on the same budget.

If you have any questions, feel free to reach out to me at `hello@akoskm.com`.

Thank you for reading, and see you in the next one 👋
