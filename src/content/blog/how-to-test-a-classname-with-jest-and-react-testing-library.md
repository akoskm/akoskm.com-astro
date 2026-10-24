---
title: "How to test a className with Jest and React testing library"
publishedAt: "2023-07-08T14:53:06.166Z"
updatedAt: "2026-10-24T20:20:00.000Z"
description: "React Testing Library has no getByClassName. Query by role or text, assert the class with toHaveClass, and use querySelector only when you need a class name."
coverImage: "../../assets/covers/classname-jest-rtl.png"
tags:
  - name: "Jest"
    slug: "jest"
  - name: "react testing library"
    slug: "react-testing-library"
  - name: "Testing Library"
    slug: "testing-library"
  - name: "React"
    slug: "reactjs"
  - name: "Testing"
    slug: "testing"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
faq:
  - question: "Does React Testing Library have getByClassName?"
    answer: "No. On 16.3.3, screen has no class query. Query with screen.getByRole or screen.getByText, then toHaveClass. container.querySelector and getElementsByClassName are the escape hatch, and a class is invisible to the user."
  - question: "Why doesn't getByRole with a name see the alert message?"
    answer: "The alert role's accessible name is an empty string. The text sits in the element, and this role does not take its name from the contents. Query the role, then assert the text."
  - question: "How do you assert a className with React Testing Library?"
    answer: 'screen.getByRole("alert"), then expect(alert).toHaveClass("alert", "alert-error"). toHaveClass comes from @testing-library/jest-dom 7.0.1.'
  - question: "How do you check CSS with React Testing Library?"
    answer: 'toHaveStyle reads computed style. display: none matched. color: red computed to rgb(255, 0, 0) on jsdom 30.1.3, and toHaveStyle passed only with that rgb string. toHaveClass checks the class token.'
  - question: "Does toHaveTextContent require the full string?"
    answer: 'With jest-dom 7.0.1 loaded, "went wrong" matched "Something went wrong". I ran that assertion on Jest 30.5.2. Vitest 5 browser mode is exact and uses toMatchTextContent for a substring.'
  - question: "When is container.querySelector acceptable?"
    answer: "When the role and the selector option cannot see the node. querySelector and getElementsByClassName lock the test to a class, so they stay the escape hatch."
---

React Testing Library has no `getByClassName`. I checked `screen` on 16.3.3, and no key on it mentions class.

Query the node by role or by text, then assert the class with `toHaveClass` from `@testing-library/jest-dom`.

```tsx
import { render, screen } from "@testing-library/react";

render(<Alert type="error" message="Something went wrong" />);

const alert = screen.getByRole("alert");
expect(alert).toHaveTextContent("Something went wrong");
expect(alert).toHaveClass("alert", "alert-error");
```

`render` and `screen` come from that import. Jest's setup file is `import "@testing-library/jest-dom"`. Vitest's is `import "@testing-library/jest-dom/vitest"`. The assertions are the same on both runners.

`container.querySelector` and `container.getElementsByClassName` still find the node. They are the escape hatch. The [manual queries](https://testing-library.com/docs/queries/about/#manual-queries) section says not to aim `querySelector` at a class or an id, because the user cannot see either. If a role query and a text query miss the node, that section says to use a test id.

```tsx
const { container } = render(
  <Alert type="error" message="Something went wrong" />
);

expect(container.querySelector(".alert.alert-error")).toHaveTextContent(
  "Something went wrong"
);

const byClassName = container.getElementsByClassName("alert-error");
expect(byClassName).toHaveLength(1);
expect(byClassName[0]).toHaveClass("alert", "alert-error");
```

`getElementsByClassName` returns a collection. The node is `[0]`.

Vitest needs jsdom and that setup file. The config I ran:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

`src/test/setup.ts` is the Vitest import above. The React Testing Library [setup page](https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-vitest) says `globals: true` so `cleanup` runs after each test. With globals off, you call `cleanup` from `afterEach` yourself. In a Vite app this `test` block lives in `vite.config.ts`. The rest of that scaffold is [How to test React apps with Vitest and Vite](/how-to-test-react-apps-with-vitest-and-vite/).

From Jest 28 on, jsdom is a separate package and it is not the default environment. The [setup page](https://testing-library.com/docs/react-testing-library/setup/#jest-28) says to install `jest-environment-jsdom` and set `testEnvironment` to `jsdom`. The [jest-dom readme](https://github.com/testing-library/jest-dom#usage) points `setupFilesAfterEnv` at `import "@testing-library/jest-dom"`. Jest 30.5.2 still works that way.

I ran the role query and both class lookups on React 19.3.1, React Testing Library 16.3.3, and `@testing-library/jest-dom` 7.0.1. Jest 30.5.2 and Vitest 5.0.5, jsdom 30.1.3 for both.

`getByRole("alert", { name: "Something went wrong" })` does not find this alert. The accessible name was `""`. The words were in the div. The `alert` role does not take its name from the contents, so the `name` option never sees them. A button does. This alert does not.

```tsx
interface Props {
  type: "error" | "success";
  message: string;
}

export default function Alert({ type, message }: Props) {
  return (
    <div role="alert" className={`alert alert-${type}`}>
      {message}
    </div>
  );
}
```

The check people usually want is the one Enzyme made easy: this node has `alert-error`, and it says something went wrong.

```tsx
const component = mount(<Alert type="error" message="Something went wrong" />);

expect(component.find(".alert.alert-error").text()).toBe(
  "Something went wrong"
);
```

That was Enzyme. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) is built so you don't test what the user can't see, and a class is one of those things. The [migration notes](https://testing-library.com/docs/react-testing-library/migrate-from-enzyme) still say it: users see buttons, headings, and forms by their role, not by `id`, `class`, or tag name. I wrote the longer version of that argument in [Why avoid testing implementation details](/testing-implementation-details/).

A test that only does `getByText("Something went wrong")` is weaker than the Enzyme one when the same sentence also appears in a paragraph, or when the error class is applied from a prop and you want that class on this render. The role query above is the one I keep. The next two are what I use when the markup has no role.

## Why doesn't getByRole with a name see the alert message?

This is the failure, copied from the Jest run:

```text
TestingLibraryElementError: Unable to find an accessible element with the role "alert" and name "Something went wrong"

Here are the accessible roles:

  alert:

  Name "":
  <div
    class="alert alert-error"
    role="alert"
  />
```

The text is in the element. The name computation ignores it. `getByRole("alert")` with no name returns the node, and `toHaveTextContent` plus `toHaveClass` do the rest.

`toHaveClass("alert", "alert-error")` checks each class on its own. Order in the `class` attribute does not matter. `toHaveClass("alert alert-error")` passed too, both names in one string.

`toHaveStyle` is the matcher for a CSS property. It compares computed style. I rendered a node with `style={{ display: "none" }}` and a `<style>` tag of `.painted { color: red; }`.

```tsx
expect(node).toHaveStyle({ display: "none" });
expect(node).toHaveStyle({ color: "rgb(255, 0, 0)" });
```

`toHaveStyle({ color: "red" })` failed. jsdom 30.1.3 computed `rgb(255, 0, 0)`. An inline `style="background-color: red"` did the same. The [jest-dom readme](https://github.com/testing-library/jest-dom#tohavestyle) still asserts `backgroundColor: "red"`, and that assertion failed here. The rgb string passed. Jest 30.5.2 and Vitest 5.0.5 agreed. Vitest with `css: true` also loaded a CSS file whose rule was `color: rgb(0, 128, 0)`, and `toHaveStyle` matched that computed value. I did not load the file under Jest.

`toHaveTextContent` from jest-dom 7.0.1 still matches a substring. `expect(alert).toHaveTextContent("went wrong")` passed against `Something went wrong`. The [Vitest 5 migration guide](https://vitest.dev/guide/migration#tohavetextcontent-now-performs-strict-equality) says browser mode made `toHaveTextContent` an exact match, and the substring check, including regular expressions, moved to `toMatchTextContent`. This run was jsdom, so the matcher was jest-dom's.

If the alert should have a real accessible name, put it on the element with `aria-label` or `aria-labelledby`. Then the `name` option works, because you gave it a name. The component above does not.

## When does the selector option earn its keep?

`getByText` still takes a `selector`. The text and the class have to land on the same node. I prefer this to walking `container` when an old screen has no role and I only need one element.

```tsx
render(<Alert type="error" message="Something went wrong" />);

expect(
  screen.getByText("Something went wrong", {
    selector: ".alert.alert-error",
  })
).toBeInTheDocument();
```

That passed on Jest 30.5.2. It passed again on Vitest. It will also pass if a second copy of the sentence exists outside `.alert.alert-error`, which is the case the plain `getByText` gets wrong.

The selector is still a class. A rename of `alert-error` breaks the test and changes nothing a reader can see. Use it on markup you do not own yet. New components get a role.

## When is container.querySelector the last resort?

`container` is the div React Testing Library rendered into. `querySelector` works on it, and so does `getElementsByClassName`. The [manual queries](https://testing-library.com/docs/queries/about/#manual-queries) section still says not to use that hatch for a class or an id. The user cannot see them. A test id is the fallback that section names. Same reason as the Enzyme finder. I keep the class lookup for a node the role queries and `getByText` cannot see. A styled wrapper with no text of its own, mostly. If you can add `role="alert"`, do that and delete the selector.

```tsx
const { container } = render(
  <Alert type="error" message="Something went wrong" />
);

expect(container.querySelector(".alert.alert-error")).toHaveTextContent(
  "Something went wrong"
);

const byClassName = container.getElementsByClassName("alert-error");
expect(byClassName).toHaveLength(1);
expect(byClassName[0]).toHaveClass("alert", "alert-error");
```

Props that decide the class are covered in [How to test props in React Testing Library](/how-to-test-props-in-react-testing-library/). Swapping that prop on a component you already mounted is [`rerender`](/how-to-use-rerender-in-react-testing-library/). The runner I use for new suites is [Vitest](/how-to-test-react-apps-with-vitest-and-vite/).

## FAQ

### Does React Testing Library have getByClassName?

No. On 16.3.3, screen has no class query. Query with screen.getByRole or screen.getByText, then toHaveClass. container.querySelector and getElementsByClassName are the escape hatch, and a class is invisible to the user.

### Why doesn't getByRole with a name see the alert message?

The alert role's accessible name is an empty string. The text sits in the element, and this role does not take its name from the contents. Query the role, then assert the text.

### How do you assert a className with React Testing Library?

screen.getByRole("alert"), then expect(alert).toHaveClass("alert", "alert-error"). toHaveClass comes from @testing-library/jest-dom 7.0.1.

### How do you check CSS with React Testing Library?

toHaveStyle reads computed style. display: none matched. color: red computed to rgb(255, 0, 0) on jsdom 30.1.3, and toHaveStyle passed only with that rgb string. toHaveClass checks the class token.

### Does toHaveTextContent require the full string?

With jest-dom 7.0.1 loaded, "went wrong" matched "Something went wrong". I ran that assertion on Jest 30.5.2. Vitest 5 browser mode is exact and uses toMatchTextContent for a substring.

### When is container.querySelector acceptable?

When the role and the selector option cannot see the node. querySelector and getElementsByClassName lock the test to a class, so they stay the escape hatch.

I hope the alert query saves you the confused half hour I spent on the empty name.

Thanks for reading.

Ákos
