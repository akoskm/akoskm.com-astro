---
title: "This synthetic event is reused for performance reasons"
publishedAt: "2022-10-10T15:36:54.533Z"
updatedAt: "2026-10-23T20:30:00.000Z"
description: "On React 16, copy e.target.value before setState, or call e.persist(). The synthetic event is reused and then nullified. React 17 removed this event pooling."
coverImage: "../../assets/covers/react-synthetic-event.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Web Development"
    slug: "web-development"
  - name: "JavaScript"
    slug: "javascript"
  - name: "React Native"
    slug: "react-native"
  - name: "webdev"
    slug: "webdev"
series: null
draft: false
---

`This synthetic event is reused for performance reasons` shows up on React 16 when you read `e.target` after the handler returns. Copy it first: `const { value } = e.target`, then pass `value` into `setState`. `e.persist()` keeps the whole event if you still need it.

React does many things under the hood to improve performance. One of those things is passing synthetic event objects to event handlers instead of real event objects.

_This is only relevant for React 16 and React Native! In React 17, you don't have this problem anymore._

When the event handler call ends, React nullifies the properties of the synthetic event object.

If you try to access any of the `e.target` properties after the event handler has exited, you will get `null`.

## Demo

Let me demonstrate this with a simple example:

```js
function handleChange(e) {
  console.log("enter", e.target.value);
  setTimeout(() => {
    console.log(e.target);
  }, 100);
  console.log("exit", e.target.value);
}
```

![warning.gif](https://cdn.hashnode.com/res/hashnode/image/upload/v1665403497259/mZMi-tYbP.gif)

You can also try the sandbox [here](https://codesandbox.io/s/happy-dust-x256lb?file=/src/App.js).

The warning in the console:

_Warning: This synthetic event is reused for performance reasons. If you see this, you're accessing the property `target` on a released/nullified synthetic event. This is set to null. If you must keep the original synthetic event around, use event.persist(). See https://fb.me/react-event-pooling for more information._

## Real-world scenario

I wanted to add a new input to an existing form in a React 16 application.

The codebase used refs to capture input values instead of `onChange` handles. I thought: "We can do better than this." and added a proper `onChange` handle for my new input.

Because of the existing logic, I also had to merge the current state with the value of my input:

```js
function handleEmailInput(e) {
  setState(prevState => ({
    ...prevState,
    userEmail: e.target.value,
  }));
}
```

And this is where the problem surfaced:

_Warning: This synthetic event is reused for performance reasons._

Alongside with an error on that line where I was setting the new state:

```text
Uncaught TypeError: e.target is null
```

I was curious about what's happening under the hood, so I added a `console.log` to see what happens inside `setState`:

```js
function handleEmailInput(e) {
  setState(prevState => {
    console.log(e.target);
    return {
      ...prevState,
      userEmail: e.target.value,
    };
  });
}
```

On the first keypress inside the form, nothing unusual has happened. I received the target element on the console, as I expected:

```html
<input
  id="email"
  class="form-control"
  style="max-width: 400px;"
  name="email"
  placeholder="eg. bar@example.com"
  type="email"
  aria-invalid="false"
  value=""
  data-com.bitwarden.browser.user-edited="yes"
/>
```

However, on the next keypress, I received `null`.

As we explained at the beginning of this post and the [docs](https://reactjs.org/docs/legacy-event-pooling.html) also write, this was happening because the `SyntheticEvent` object that `handleEmailInput` received had its properties nullified after the event handler call ended.

And because `setState` actions are asynchronous and are batched for performance gains, the callback will be called after we have already left the `handleEmailInput` function.

## Solutions

There are two solutions to overcome this.

First is what the docs tell you:

Call `e.persist();` to persist the event that entered your input handler.

But I've found another way to deal with this problem.

I'm simply copying the value of `e.target.value` contained in the Syntethic event, so I can access it even after the function has exited:

```js
function handleEmailInput(e) {
  const { value } = e.target;
  setState(prevState => ({
    ...prevState,
    userEmail: value,
  }));
}
```

I hope this post helped you to avoid the warning and fix your application's behavior.

Let me know if you have any comments or questions regarding this solution!
