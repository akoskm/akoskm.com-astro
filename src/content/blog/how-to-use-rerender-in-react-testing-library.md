---
title: "How To Use rerender in React Testing Library"
publishedAt: "2024-01-12T13:39:44.781Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "rerender updates props on the component already mounted. A second render() adds a copy, so the label query matches twice."
coverImage: "../../assets/covers/rerender-react-testing-library.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "react testing library"
    slug: "react-testing-library"
  - name: "Testing Library"
    slug: "testing-library"
  - name: "Testing"
    slug: "testing"
  - name: "Web Development"
    slug: "web-development"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
faq:
  - question: "Does rerender remount the component?"
    answer: "No. It updates the component already in the document. The input kept the typed text when the error prop changed."
  - question: "Why does calling render() twice fail the query?"
    answer: 'The second render mounts a second copy. getByLabelText("Message:") then matches two inputs.'
  - question: "Should the parent be tested instead of rerender?"
    answer: "Yes, when you can mount the component that changes the prop. rerender is for a child you cannot mount with that parent."
  - question: "Does rerender work the same in Vitest and Jest?"
    answer: "Yes. It is the function on the object returned by render from React Testing Library 16.3.3."
---

`rerender` updates the props of the component already in the document. A second `render()` mounts another copy, and `getByLabelText` then fails because the label is there twice.

```tsx
const { rerender } = render(
  <MessageBoard submitMessage={submitMessage} error="Add a score" />
);

rerender(
  <MessageBoard submitMessage={submitMessage} error="Different error" />
);
```

You don't write components from scratch every time.

Maintaining parts of the system that have worked for years is also the job. The old rule still holds:

_If it ain't broke, don't fix it!_

Leaving a working component alone is a good default. The useful addition is a test that checks it keeps doing that job. I reach for [`rerender`](https://testing-library.com/docs/react-testing-library/api/#rerender) in legacy code, on the components and on the tests around them.

The docs still open with the disclaimer: you'd probably rather test the component that changes the prop. Sometimes that parent takes a pile of setup you do not have. The board below only stores what you type, and it prints an `error` it does not own.

```tsx
import { useState, type FormEvent } from "react";

interface Props {
  submitMessage: (message: string) => void;
  error?: string;
}

export default function MessageBoard({ submitMessage, error }: Props) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitMessage(message);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Message:
        <input
          onChange={event => setMessage(event.target.value)}
          value={message}
        />
      </label>
      <input type="submit" value="Submit" />
      {error ? <p>{error}</p> : null}
    </form>
  );
}
```

I re-ran this on React 19.3.1 and React Testing Library 16.3.3, under Vitest 5.0.5. `render` from Jest 30 returns the same `rerender`.

## Why doesn't a second render() work?

Once the board is on the page, `render` has no slot for a new error. Another call with `error="Different error"` drops a second form into `document.body`.

```tsx
render(<MessageBoard submitMessage={submitMessage} error="Initial error" />);
render(<MessageBoard submitMessage={submitMessage} error="Different error" />);

expect(screen.getAllByLabelText("Message:")).toHaveLength(2);
```

That length check passed. `getByLabelText("Message:")` (the one that expects a single node) still throws `TestingLibraryElementError: Found multiple elements with the text of: Message:`.

![Two message inputs after a second render](https://cdn.hashnode.com/res/hashnode/image/upload/v1705055547507/55b940b8-aae7-4015-9e7f-30c537a35ad1.png)

The first input can hold what you typed. The second one is empty. Queries that assume one field stop there.

## How do you keep the typed message when the error changes?

Take `rerender` off the object `render` returns. Pass the same component with the next prop. One form stays in the document. The input keeps its value. The error text swaps.

`userEvent.type` has to be awaited, and it wants `userEvent.setup()` first. `@testing-library/user-event` 14.6.8 is the package I installed. The direct `userEvent.type(...)` call from the older notes is the previous API.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MessageBoard from "./MessageBoard";

const submitMessage = vi.fn();

test("keeps the typed message when the error prop changes", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <MessageBoard submitMessage={submitMessage} error="Add a score" />
  );

  await user.type(screen.getByLabelText("Message:"), "Hello from test!");

  rerender(
    <MessageBoard submitMessage={submitMessage} error="Different error" />
  );

  expect(screen.getByLabelText("Message:")).toHaveValue("Hello from test!");
  expect(screen.getByText("Different error")).toBeInTheDocument();
  expect(screen.queryByText("Add a score")).not.toBeInTheDocument();
  expect(screen.getAllByLabelText("Message:")).toHaveLength(1);
});
```

`screen.debug()` before and after `rerender` is still the fastest way to see that you have one form.

![One message input after rerender](https://cdn.hashnode.com/res/hashnode/image/upload/v1705055936521/b2c55ffb-3e84-493a-b081-3ea2a260fb40.png)

The label query works because the input sits inside `<label>Message:`. That part has not changed.

When the prop is coming from a parent you can actually mount, test that parent. I wrote the mock for that case in [How to test props in React Testing Library](/how-to-test-props-in-react-testing-library/). The Vitest config these files ran under is in [How to test React apps with Vitest and Vite](/how-to-test-react-apps-with-vitest-and-vite/).

## When is rerender the wrong tool?

When a click in the parent is what changes the prop, test the click. `rerender` skips that parent and stuffs the next value in by hand. Fine for a board you cannot mount with its owner. A bad habit when the owner is twenty lines.

A class that shows up because of a prop is the same shape of problem. The query for that is in [How to test a className with Jest and React Testing Library](/how-to-test-a-classname-with-jest-and-react-testing-library/).

## FAQ

### Does rerender remount the component?

No. It updates the component already in the document. The input kept the typed text when the error prop changed.

### Why does calling render() twice fail the query?

The second render mounts a second copy. getByLabelText("Message:") then matches two inputs.

### Should the parent be tested instead of rerender?

Yes, when you can mount the component that changes the prop. rerender is for a child you cannot mount with that parent.

### Does rerender work the same in Vitest and Jest?

Yes. It is the function on the object returned by render from React Testing Library 16.3.3.

Thanks for reading.

Ákos
