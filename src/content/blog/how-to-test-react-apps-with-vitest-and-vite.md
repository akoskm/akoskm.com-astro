---
title: "How to test React apps with Vitest and Vite"
publishedAt: "2024-04-19T15:47:42.436Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "Test a Vite React app with Vitest 5. The current starter button says Count is 0. Add vitest/globals next to vite/client."
coverImage: "../../assets/covers/vitest-vite-react.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "vite"
    slug: "vite"
  - name: "vitest"
    slug: "vitest"
  - name: "unit testing"
    slug: "unit-testing"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Testing"
    slug: "testing"
  - name: "Testing Library"
    slug: "testing-library"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
faq:
  - question: "Which versions did this Vitest setup pass on?"
    answer: "React 19.3.1, Vite 8.3.5, Vitest 5.0.5, React Testing Library 16.3.3, jest-dom 7.0.1, user-event 14.6.8, and jsdom 30.1.3, on Node 22.23.4."
  - question: "Where do the Vitest types go in a new Vite app?"
    answer: "In tsconfig.app.json, inside the types array, next to vite/client. The root tsconfig.json only lists project references."
  - question: "What text does the React starter render now?"
    answer: "The counter button says Count is 0. The Vite + React heading is not in the template from create-vite 9.3.1."
  - question: "Why does the console say it could not parse a CSS stylesheet?"
    answer: "jsdom 30 prints that for the starter CSS. The counter tests still passed with css: true."
---

Add a `test` block to the Vite config you already have, import `@testing-library/jest-dom/vitest` from a setup file, and click the starter's counter. On the React template from create-vite 9.3.1 the button reads Count is 0.

```tsx
const user = userEvent.setup();
render(<App />);
await user.click(screen.getByRole("button", { name: /count is 0/i }));
expect(screen.getByRole("button", { name: /count is 1/i })).toBeInTheDocument();
```

That passed. React 19.3.1, Vite 8.3.5, Vitest 5.0.5, `@vitejs/plugin-react` 6.1.2, React Testing Library 16.3.3, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8, jsdom 30.1.3. Node was 22.23.4. The scaffold also installed TypeScript 6.0.3.

I started these examples on the Babel and Jest setup I had used for years. People kept asking why it wasn't Vitest. So I tried Vitest, and it blew my mind.

If I have to summarize in one sentence why Vitest is so good compared to Jest, it is that you don't need a PhD to configure all these things. You use the Vite config you already have, add a few lines, and the tests run.

The [2024 video](https://youtu.be/nvkRBHXIi2M) still walks the old starter. The button text in the snippet is what the template renders now. An existing Vite app can skip the scaffold and start at the config.

## How do you scaffold the Vite app?

create-vite 9.3.1:

```bash
npm create vite@latest vitest-demo -- --template react-ts
```

The `--` is there so npm forwards `--template` to create-vite. In a terminal the CLI asks questions unless you also pass `--no-interactive`. Then:

```bash
npm install
npm run dev
```

The app is on http://localhost:5173.

A smoke test before any React. `sum.ts`:

```ts
export function sum(a: number, b: number) {
  return a + b;
}
```

`sum.test.ts`:

```ts
import { expect, test } from "vitest";
import { sum } from "./sum";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
```

Install Vitest, add `"test": "vitest"` to `scripts`, run `npm test`. That file passed before I installed Testing Library. If the suite is still Mocha, the older move is [How to migrate from Mocha to Jest](/mocha-to-jest-migration/). This post is the one off Jest.

## Where does the Vitest config go?

In `vite.config.ts`. The current docs want the triple-slash reference on `vitest/config`, not `vitest`. `tsc -p tsconfig.node.json` accepted the `test` key with that reference.

```ts
/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
```

`src/test/setup.ts` is one line:

```ts
import "@testing-library/jest-dom/vitest";
```

jest-dom 7 exposes that path. The bare `@testing-library/jest-dom` import is what I used under Jest. Under Vitest, `/vitest` is the one that extends Vitest's `expect`.

The template's `tsconfig.json` is only project references. Compiler options for the app live in `tsconfig.app.json`, and that file sets `"types": ["vite/client"]`. The array is exclusive. `globals: true` runs in Vitest, and `tsc` then reports `Cannot find name 'test'`. Add the Vitest globals next to the Vite client types:

```json
"types": ["vite/client", "vitest/globals"]
```

I ran `tsc -p tsconfig.app.json` before that line and after it. Before, every `test` and `expect` failed. After, the project typechecked. `include` is already `"src"`, so `src/test/setup.ts` is part of the program. No extra include entry.

Install the rest:

```bash
npm install -D vitest @testing-library/jest-dom @testing-library/react @testing-library/user-event jsdom
```

Those are the packages that resolved to the versions at the top.

## What does the counter test look like on the current starter?

`App.tsx` from this template has one `<button>`. The label is `Count is {count}`. There is no heading that says Vite + React, so the old `getByText(/Vite \+ React/i)` fails on a fresh app.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("shows the counter", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /count is 0/i })
    ).toBeInTheDocument();
  });

  it("increments the counter on click", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /count is 0/i }));
    expect(
      screen.getByRole("button", { name: /count is 1/i })
    ).toBeInTheDocument();
  });
});
```

`userEvent.click` without `setup()` is the old call. 14.6.8 wants `const user = userEvent.setup()` and an `await`.

jsdom printed `Could not parse CSS stylesheet` three times. The starter CSS uses syntax jsdom 30 does not parse. Both tests passed with `css: true` anyway.

Vitest 5 clears mock call history before each test. A `vi.fn()` that was called in one test has zero calls in the next. I hit that with a two-test file. Assert in the test that did the calling. The pattern for a child component is in [How to test props in React Testing Library](/how-to-test-props-in-react-testing-library/).

[`rerender`](/how-to-use-rerender-in-react-testing-library/) and [a className on an alert](/how-to-test-a-classname-with-jest-and-react-testing-library/) use this same runner. React Router's Vite plugin needs one extra line, in [the React Router example](/react-router-vitest-example/). When jsdom is the wrong place to run the component, the browser runner is [Vitest browser mode with Playwright](/react-component-testing-with-vitests-browser-mode-and-playwright/).

## FAQ

### Which versions did this Vitest setup pass on?

React 19.3.1, Vite 8.3.5, Vitest 5.0.5, React Testing Library 16.3.3, jest-dom 7.0.1, user-event 14.6.8, and jsdom 30.1.3, on Node 22.23.4.

### Where do the Vitest types go in a new Vite app?

In tsconfig.app.json, inside the types array, next to vite/client. The root tsconfig.json only lists project references.

### What text does the React starter render now?

The counter button says Count is 0. The Vite + React heading is not in the template from create-vite 9.3.1.

### Why does the console say it could not parse a CSS stylesheet?

jsdom 30 prints that for the starter CSS. The counter tests still passed with css: true.

You have Vitest running the React tests.

Ákos
