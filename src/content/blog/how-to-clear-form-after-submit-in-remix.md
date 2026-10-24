---
title: "How to clear form after submit in Remix"
publishedAt: "2023-12-04T08:30:10.112Z"
updatedAt: "2023-12-09T06:14:10.561Z"
description: "Optimize Remix form clearing with useActionData hook, HTMLFormElement's reset, and React's useRef, minimizing client-side logic"
brief: "Clearing a form in React after submission is typically accomplished by setting the states containing the input values to an empty string.\nIn the case of a simple TodoList component, this means something like this:\nconst TodoList = () => {\n  const [ti..."
subtitle: "Without using states"
readTimeInMinutes: 3
coverImage: "../../assets/posts/how-to-clear-form-after-submit-in-remix/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Remix"
    slug: "remix"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Full Stack Development"
    slug: "full-stack-development"
series:
  name: "Remix"
  slug: "remix"
draft: false
---

Clearing a form in React after submission is typically accomplished by setting the states containing the input values to an empty string.

In the case of a simple TodoList component, this means something like this:

```javascript
const TodoList = () => {
  const [title, setTitle] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/todo', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Add Todo</button>
    </form>
  );
};
```

If you saw my post [The Ultimate Full Stack Framework for 2024: Remix](https://akoskm.com/the-ultimate-full-stack-framework-for-2024-remix), you know that with Remix, you can completely avoid most of the states and still reset the form after the submission is complete.

Let's see how!

## The useActionData hook {#heading-the-useactiondata-hook}

Remix provides many helpful hooks for submitting forms, inspecting if the page is loading, or automatically capturing output values of backend actions.

The hook that helps you with the latter is [`useActionData`](https://remix.run/docs/en/main/hooks/use-action-data).

It works like this:

```typescript
// server action
export async function action({ request }: ActionFunctionArgs) {
  return json({ ok: true });
}

// client
function Todo() {
  const actionData = useActionData();
  
  // after you fire a request to your action by submitting this form
  // after the response actionData will be { ok: true }
  return (
    <Form>
      <button>Submit</button>
    </Form>
  );
}
```

You fire a request by submitting the only form on the page. After the request is completed, the response is in `actionData`. In this case, it's `{ ok: true }`.

We can use the value in `actionData` to detect that the submission was successful.

Here's how to achieve that with things built into React and Remix.

## Capturing the results {#heading-capturing-the-results}

When `actionData` first runs on the client, it returns `undefined`.

Because of this, we have to react (🥁) when `actionData` change from `undefined` to `{ ok: true }`:

```typescript
function Todo() {
  const actionData = useActionData();
  
  useEffect(() => {
    if (actionData?.ok) {
      // reset the form
    }
  }, [actionData);

  // rest of the component
}
```

Now, we have a way to identify that the submission is completed.

Let's reset the form!

To do that, we're going to use the HTMLFormElement's [`reset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset) method.

## Capturing the form {#heading-capturing-the-form}

To call the `reset` method on the `HTMLFormElement` we need a way to capture a reference to it.

This is where React's [useRef](https://react.dev/reference/react/useRef) helps us:

```typescript
function Todo() {
  const form = useRef<>(null);

  // use effect as before
  return (
    <Form ref={form}> ... </Form>
  );
}
```

### Clearing the form {#heading-clearing-the-form}

Now that we both know when the request was finished and have a reference to the form that sent the request, let's combine the above two snippets:

```typescript
// server action
export async function action({ request }: ActionFunctionArgs) {
  return json({ ok: true });
}

// client
function Todo() {
  const actionData = useActionData();
  const form = useRef<>(null);

  useEffect(() => {
    if (actionData?.ok) {
      form.current?.reset();
    }
  }, [actionData])
  
  // after you fire a request to your action by submitting this form
  // after the response actionData will be { ok: true }
  return (
    <Form>
      <input name="title" />
      <button>Submit</button>
    </Form>
  );
}
```

## Conclusion {#heading-conclusion}

I like that this approach relies on information that's coming from Remix and not from some kind of states that we manually tracked before.

The problem with such app state tracking is that it gets out of control once you add a separate state for loading indicators, error messages, disabling inputs, and buttons on form submission.

All this can be achieved with Remix's built-in hooks without using a single state. This reduces the amount of client-side logic you implement and later maintain.

Have fun using Remix!
