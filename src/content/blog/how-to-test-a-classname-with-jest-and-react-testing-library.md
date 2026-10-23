---
title: "How to test a className with Jest and React testing library"
publishedAt: "2023-07-08T14:53:06.166Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "Query the alert by role, then toHaveClass. The alert's accessible name is empty, so a name option does not see the text."
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
  - question: "Why doesn't getByRole with a name see the alert message?"
    answer: "The alert role's accessible name is an empty string. The text sits in the element, and this role does not take its name from the contents. Query the role, then assert the text."
  - question: "How do you assert a className with React Testing Library?"
    answer: 'screen.getByRole("alert"), then expect(alert).toHaveClass("alert", "alert-error"). toHaveClass comes from @testing-library/jest-dom 7.0.1.'
  - question: "Does toHaveTextContent require the full string?"
    answer: 'With jest-dom 7.0.1 loaded, "went wrong" matched "Something went wrong". I ran that assertion on Jest 30.5.2.'
  - question: "When is container.querySelector acceptable?"
    answer: "When the role and the selector option cannot see the node. It locks the test to a class, so it stays the escape hatch."
---

Query the alert by its role, then assert the text and the classes on that node. `getByRole("alert", { name: "Something went wrong" })` does not find it.

```tsx
render(<Alert type="error" message="Something went wrong" />);

const alert = screen.getByRole("alert");
expect(alert).toHaveTextContent("Something went wrong");
expect(alert).toHaveClass("alert", "alert-error");
```

I ran that on React 19.3.1, React Testing Library 16.3.3, and `@testing-library/jest-dom` 7.0.1. Same result under Jest 30.5.2 and under Vitest 5.0.5. The accessible name of the alert was `""`. The words were in the div. The `alert` role does not take its name from the contents, so the `name` option never sees them. A button does. This alert does not.

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

`toHaveClass("alert", "alert-error")` checks each class on its own. Order in the `class` attribute does not matter.

`toHaveTextContent` from jest-dom 7.0.1 still matches a substring. `expect(alert).toHaveTextContent("went wrong")` passed against `Something went wrong`. Vitest 5 has its own stricter matcher under that name. The one that ran here is jest-dom's, because the setup file imports `@testing-library/jest-dom` (Jest) or `@testing-library/jest-dom/vitest` (Vitest).

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

`container` is the div React Testing Library rendered into. `querySelector` works on it. The docs still call this the thing to avoid, for the same reason as the Enzyme finder.

```tsx
const { container } = render(
  <Alert type="error" message="Something went wrong" />
);

expect(container.querySelector(".alert.alert-error")).toHaveTextContent(
  "Something went wrong"
);
```

I keep this for a node the role queries and `getByText` cannot see. A styled wrapper with no text of its own, mostly. If you can add `role="alert"`, do that and delete the selector.

Props that decide the class are covered in [How to test props in React Testing Library](/how-to-test-props-in-react-testing-library/). Swapping that prop on a component you already mounted is [`rerender`](/how-to-use-rerender-in-react-testing-library/). The runner I use for new suites is [Vitest](/how-to-test-react-apps-with-vitest-and-vite/).

## FAQ

### Why doesn't getByRole with a name see the alert message?

The alert role's accessible name is an empty string. The text sits in the element, and this role does not take its name from the contents. Query the role, then assert the text.

### How do you assert a className with React Testing Library?

screen.getByRole("alert"), then expect(alert).toHaveClass("alert", "alert-error"). toHaveClass comes from @testing-library/jest-dom 7.0.1.

### Does toHaveTextContent require the full string?

With jest-dom 7.0.1 loaded, "went wrong" matched "Something went wrong". I ran that assertion on Jest 30.5.2.

### When is container.querySelector acceptable?

When the role and the selector option cannot see the node. It locks the test to a class, so it stays the escape hatch.

I hope the alert query saves you the confused half hour I spent on the empty name.

Thanks for reading.

Ákos
