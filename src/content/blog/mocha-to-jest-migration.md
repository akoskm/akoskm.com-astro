---
title: "How to migrate from Mocha to Jest"
publishedAt: "2021-05-12T14:17:06.998Z"
updatedAt: "2021-06-24T14:46:06.837Z"
description: "Move a Mocha suite to Jest with small edits instead of rewriting tests, including JSDOM via Jest's testEnvironment and mocha.opts."
brief: "Jest is a simple testing library that works with zero configuration. Because of its great API - if you're already using Mocha - with a few find & replace and minimal effort, you can move to Jest without rewriting any of your tests.\nIn this post, I'll..."
readTimeInMinutes: 4
coverImage: "../../assets/posts/mocha-to-jest-migration/cover.jpeg"
tags:
  - name: "JavaScript"
    slug: "javascript"
  - name: "unit testing"
    slug: "unit-testing"
  - name: "Testing"
    slug: "testing"
  - name: "Jest"
    slug: "jest"
series: null
draft: false
---

Jest is a simple testing library that works with zero configuration. Because of its great API - if you're already using Mocha - with a few find & replace and minimal effort, you can move to Jest without rewriting any of your tests.

In this post, I'll show you how I tweaked my existing Mocha setup to achieve this.

If you're new to Jest, don't forget to check out their [Getting Started](https://jestjs.io/docs/en/getting-started) page as well.

I personally got hooked on this library when I realized it comes with a configuration option [testEnvironment](https://jestjs.io/docs/en/configuration#testenvironment-string), that gives you a test environment with a JSDOM that works out of the box, without actually configuring JSDOM. I've lost count, across all projects, how many times I wanted to update the testing environment and ended up not doing it because I couldn't get JSDOM to work with my existing tests.

Let's jump straight into it!

# Configuration {#configuration}

I use `mocha.opts` to configure Mocha. The contents of this file are important because I'm going to reference them later:

```
--reporter spec
--ui bdd
--colors
--file test_helpers/babel_loader.js
--file test_helpers/jsdom_setup.js
--file test_helpers/test_setup.js
```

and this is how I used to run Mocha:
```
mocha --opts mocha.opts
```

You can configure Jest with `jest.config.js`, a js or JSON file with the `--config` flag, and in `package.json`, see [Configuring Jest](https://jestjs.io/docs/en/configuration.html). I suggest you start with `package.json` because I think that's the simplest. Once the configuration gets more complex, you can always move it into a separate file.
In `package.json` you should use the key `"jest"` on the top level, like this:

```js
{
  "name": "my-project",
  "jest": {
    "verbose": true
  }
}
```
now you should be able to run Jest as:

```
jest
```

# Setup {#setup}

This is the only place where depending on what other libraries you use in your tests, you might want to tweak their setup a bit.

In my case, `test_helpers/test_setup.js` had the environment setup for Mocha.
If you're using Enzyme or Sinon for example, this is the place where you keep their configuration.
Let's say your file has something similar:
```js
global.sinonSandbox = sinon.createSandbox();
afterEach(function() {
  return global.sinonSandbox.restore();
});
```
Then you should be able to reuse this with Jest.

Jest does its environment setup with [`setupFilesAfterEnv`](https://jestjs.io/docs/en/configuration#setupfilesafterenv-array).
This option tells the library which file(s) to run before each test. Put this into `package.json` after `verbose`:

```js
{
  "name": "my-project",
  "jest": {
    "verbose": true,
    "setupFilesAfterEnv": ["<rootDir>/test_helpers/test_setup.js"]
  }
}
```

Side-note: this doesn't exactly match the behavior of the Mocha configuration. Instead of creating only one sandbox, now we create one sandbox before each test. However, there should be no difference in how Sinon interacts with your tests.

# Hooks {#hooks}

Mocha operates with a wide variety of hooks. I mostly used `describe()`, `context()`, `it()`, `before()`, `after()`, `beforeEach()`, and `afterEach()`.

Jest uses a bit different naming, in general, you're safe to replace:

`before` ➡️ `beforeAll`

`after` ➡️ `afterAll`

`context` doesn't have an equivalent in Jest, so I decided to use `describe`.
You can find & replace all occurrences of `context`, `before`, and `after` or put the following code into `test_helpers/test_setup.js`:

```js
// mocha keyword mappings
window.context = describe;
window.before = beforeAll;
window.after = afterAll;
```

# Function parameters {#function-parameters}

With Mocha, you were able to give hooks a description:
```js
beforeEach(description, fn)
afterEach(description, fn)
```

in Jest, hooks only accept a function and an optional timeout:

```js
beforeEach(fn, timeout)
afterEach(fn, timeout)
```

If your `beforeEach` blocks looked something like this:

```js
beforeEach('login', () => {
```

to strip out the descriptions from every `beforeEach` run the following regular expression in your editor:

```
beforeEach\([^(]*
```
and replace it with
```
beforeEach(
```


# Babel {#babel}

We set up Babel in `test_helpers/babel_loader.js` for Mocha:

```js
// Run before any test files are loaded to use Babel for subsequent parsing
require('@babel/register')({
  ignore: [/node_modules\//],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});
```

You have to install `babel-jest` to use Babel with Jest:
```
yarn add --dev babel-jest
```

then add `transfer` to `package.json` that now should look like this:
```js
{
  "name": "my-project",
  "jest": {
    "verbose": true,
    "setupFilesAfterEnv": ["<rootDir>/test_helpers/test_setup.js"],
    "transform": {
      "^.+\\.[t|j]sx?$": "babel-jest",
    }
  }
}
```

See more on [using Babel with Jest](https://jestjs.io/docs/en/getting-started#using-babel).

At this point, you're pretty much ready to run your existing tests with Jest.
# Conclusion {#conclusion}

What I really liked about Jest is the "work great by default" philosophy.

Even when installed in an empty package and run, it gives you a meaningful output:

```
% jest
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /Users/akoskm/Projects/test
  2 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 2 matches
  testRegex:  - 0 matches
Pattern:  - 0 matches
```

It doesn't ask for configuration files or necessary parameters, it simply works. I think this is a philosophy worth following when designing new tools.

What tools do you use to test your code?

Are you stuck in the middle of a migration? Let me know in the comments or find me on <a href="https://twitter.com/akoskm">Twitter</a>.
