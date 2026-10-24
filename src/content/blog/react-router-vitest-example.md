---
title: "React Router Vitest Example"
publishedAt: "2024-12-29T13:49:50.279Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "React Router 8.5, Vite 8, and Vitest 5. Skip the React Router plugin when Vitest runs, or the preamble check throws."
coverImage: "../../assets/covers/react-router-vitest.png"
tags:
  - name: "vitest"
    slug: "vitest"
  - name: "vite"
    slug: "vite"
  - name: "react router"
    slug: "react-router"
  - name: "React"
    slug: "reactjs"
  - name: "Remix"
    slug: "remix"
  - name: "Testing"
    slug: "testing"
  - name: "Testing Library"
    slug: "testing-library"
series: null
draft: false
faq:
  - question: "Which versions did the React Router example pass on?"
    answer: "React Router 8.5.0, @react-router/dev 8.5.0, Vite 8.3.5, Vitest 5.0.5, React 19.3.1, and React Testing Library 16.3.3."
  - question: "Why does Vitest throw that it can't detect the preamble?"
    answer: "The React Router Vite plugin is loaded. Skip it when process.env.VITEST is set. The failure I saw was on the SVG import in welcome.tsx, before any assertion."
  - question: "Does the Welcome screen still say React Router Docs?"
    answer: 'Yes, on the template from create-react-router 8.5.0. getByText("React Router Docs") passed.'
  - question: "How do you test a component that calls useActionData?"
    answer: "Render it inside createRoutesStub with an action that returns the error. I clicked Login and the test found Username is required."
---

Skip the React Router Vite plugin while Vitest is running. Leave it on, and the suite dies before a single assertion.

```ts
plugins: [tailwindcss(), !process.env.VITEST && reactRouter()],
```

With the plugin loaded, Vitest 5.0.5 threw `Error: React Router Vite plugin can't detect preamble. Something is wrong.` The stack landed on `import logoDark from "./logo-dark.svg"` in `app/welcome/welcome.tsx`. With the plugin removed under `process.env.VITEST`, `getByText("React Router Docs")` passed.

I scaffolded this with create-react-router 8.5.0. The install resolved React Router 8.5.0, `@react-router/dev` 8.5.0, Vite 8.3.5, and React 19.3.1. Vitest was 5.0.5. React Testing Library was 16.3.3. The plain Vite setup, without Router, is [How to test React apps with Vitest and Vite](/how-to-test-react-apps-with-vitest-and-vite/).

React Router has been around for ages. If you shipped React early, it was one of the first libraries you added when a screen needed a URL.

Vite debuted in [April 2020](https://en.wikipedia.org/wiki/Vite_%28software%29) as a long-awaited alternative to the most popular solution that worked reliably at that time, Webpack.

Remix is the newer one. In 2022 [Shopify acquired the team](https://en.wikipedia.org/wiki/Remix_%28web_framework%29) and kept the work open source. Remix presented itself as an alternative to Next.js. Starting with React Router 7, [Remix became part of React Router](https://remix.run/blog/react-router-v7), so you don't install it beside the router. Version 8 is the line create-react-router installs now.

If I had to visualize React Router, Vite, and Remix, I'd go with some incredibly talented ninja foxes who have many years of experience and have the power and tools (open source) to disrupt a market that Webpack, Next.js, and Jest have so far owned.

![Ninja foxes, which is how I picture this stack](../../assets/posts/react-router-vitest-example/ninja-foxes.png)

## How do you create the app?

```bash
npx create-react-router@8.5.0 react-router-with-vitest --yes
```

`@latest` was 8.5.0 on 23 Oct 2026. `--yes` skips the prompts. The [docs](https://reactrouter.com/start/framework/installation) still show `npx create-react-router@latest`. `npm install` if you passed `--no-install`, then `npm run dev`. The app listens on http://localhost:5173.

The generated `vite.config.ts` does not use a `tsconfigPaths()` plugin. Vite 8 reads the paths itself:

```ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
```

`tailwindcss()` comes from `@tailwindcss/vite`. Leave that one in place for tests. The plugin that has to go is `reactRouter()`.

## Why does the React Router plugin have to come out for tests?

React Router still is not built to run inside Vitest. I confirmed it by putting the plugin back. Both test files failed to collect, with the preamble error on the SVG import, and the same error in a second file that never imported an SVG. The plugin transforms the route modules either way.

```ts
/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), !process.env.VITEST && reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
  },
});
```

`test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`process.env.VITEST` is set when Vitest loads the config. I used that flag, and the same config then ran the Welcome test and a `createRoutesStub` test. `npm test` is `"test": "vitest"` in `scripts`.

Install:

```bash
npm install -D vitest @testing-library/jest-dom @testing-library/react @testing-library/user-event jsdom
```

`globals: true` without the flag gives `ReferenceError: expect is not defined`. That one is unchanged.

The 2024 repository at [github.com/akoskm/react-router-with-vitest](https://github.com/akoskm/react-router-with-vitest) targets Router 7, Vite 6, and Vitest 2. The config above is the one that passed on 8, 8, and 5.

## What do you assert on the Welcome screen?

`app/welcome/welcome.tsx` in the 8.5.0 template still links to the docs with the text `React Router Docs`. The component does not call a router hook, so it renders without a stub.

```tsx
import { render, screen } from "@testing-library/react";
import { Welcome } from "./welcome";

test("renders the docs link", () => {
  render(<Welcome />);
  expect(screen.getByText("React Router Docs")).toBeInTheDocument();
});
```

A component that calls `useActionData` will not render on its own. [`createRoutesStub`](https://reactrouter.com/start/framework/testing) builds the context. I used a login form whose action returns a username error, clicked Login, and waited for the text.

```tsx
import { Form, useActionData } from "react-router";

export function LoginForm() {
  const actionData = useActionData() as
    | { errors?: { username?: string } }
    | undefined;

  return (
    <Form method="post">
      <label>
        Username
        <input type="text" name="username" />
      </label>
      {actionData?.errors?.username ? (
        <p>{actionData.errors.username}</p>
      ) : null}
      <button type="submit">Login</button>
    </Form>
  );
}
```

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { LoginForm } from "./login-form";

test("LoginForm renders the action error", async () => {
  const user = userEvent.setup();
  const Stub = createRoutesStub([
    {
      path: "/login",
      Component: LoginForm,
      action() {
        return { errors: { username: "Username is required" } };
      },
    },
  ]);

  render(<Stub initialEntries={["/login"]} />);
  await user.click(screen.getByRole("button", { name: "Login" }));
  expect(await screen.findByText("Username is required")).toBeInTheDocument();
});
```

Both files passed in one `vitest run`. `userEvent.setup()` again, same as the other posts. The stub is the right tool for a component that reads loader or action data. It is a poor fit for a whole route module typed with the generated `Route` types. The docs say so, and they recommend an end-to-end runner for that. Browser mode is the one I use when jsdom is the thing in the way: [Vitest's browser mode and Playwright](/react-component-testing-with-vitests-browser-mode-and-playwright/).

A prop assertion that does not need the router at all lives in [How to test props in React Testing Library](/how-to-test-props-in-react-testing-library/).

## FAQ

### Which versions did the React Router example pass on?

React Router 8.5.0, @react-router/dev 8.5.0, Vite 8.3.5, Vitest 5.0.5, React 19.3.1, and React Testing Library 16.3.3.

### Why does Vitest throw that it can't detect the preamble?

The React Router Vite plugin is loaded. Skip it when process.env.VITEST is set. The failure I saw was on the SVG import in welcome.tsx, before any assertion.

### Does the Welcome screen still say React Router Docs?

Yes, on the template from create-react-router 8.5.0. getByText("React Router Docs") passed.

### How do you test a component that calls useActionData?

Render it inside createRoutesStub with an action that returns the error. I clicked Login and the test found Username is required.

The Welcome screen rendered, and the login stub returned the error.

Ákos
