---
title: "Common useEffect Mistakes"
publishedAt: "2025-02-11T07:57:39.867Z"
description: "Avoid `useEffect` mistakes: manage dependencies, include cleanup code, and consider alternatives for data fetching to enhance performance"
brief: "Learn how to avoid the most common mistakes when using useEffect.\nWhat are the issues associated with useEffect?\nMost issues I’ve had with using useEffect result from developers often mistaking it for a lifecycle function that runs when the component..."
readTimeInMinutes: 6
coverImage: "../../assets/posts/common-useeffect-mistakes/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "useEffect"
    slug: "useeffect"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "ReactHooks"
    slug: "reacthooks"
series: null
draft: false
---

Learn how to avoid the most common mistakes when using `useEffect`.

## **What are the issues associated with useEffect?** {#heading-what-are-the-issues-associated-with-useeffect}

Most issues I’ve had with using `useEffect` result from developers often mistaking it for a lifecycle function that runs when the component is first mounted.

Indeed, something like this can be achieved with a specific case of `useEffect` in which you leave the dependency array empty; it was not designed for this. Besides, leaving an empty dependency array can lead to weird behaviors in your app.

If you forget to specify dependencies, the effect will run after every render, which can cause performance issues or even infinite loops. If you include the wrong dependencies, it might not run as expected, leading to bugs that are hard to trace.

Instead, you should think about `useEffect` as an **if-then**, meaning:

```typescript
useEffect(() => { // 2. run this
  // SETUP CODE
  const field = setUpField(player);
  field.create();

  // CLEANUP CODE
  return () => {
    field.destroy()
  };
}, [player]); // 1. when this changes
```

Forget about mounting and unmounting.

Think of this as a setup that React re-runs when it sees fit.

You should also design the `useEffect` so the user **can’t tell whether it runs once or more**. This leads us to the next common mistake.

### Cleanup {#heading-cleanup}

React will repeat your `SETUP CODE` and `CLEANUP CODE` multiple times during the component’s lifetime.

The cleanup function returned by the `useEffect` hook should clean up any connections you created, long-running calculations started, event listeners that were added, or anything else you did in your `useEffect` before repeating the setup code.

What goes into your `CLEANUP` code depends on what you did in `SETUP CODE`, which is why many developers entirely leave it out or struggle to write it correctly.

### Single useEffect {#heading-single-useeffect}

One `useEffect` should always have one responsibility.

These hooks become difficult to read or maintain when you try to accomplish multiple unrelated things inside them.

```javascript
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();

  const field = setUpField(player);
  field.create();
  // Cleanup function
  return () => {
    connection.disconnect()
    field.destroy()
  };
}, [roomId, player]);
```

The above `useEffect` will run on `roomId` or `player` update, but since the setup code is inside a single `useEffect`, you’ll set up a field for a player, even if only the `roomId` has changed.

## **Why is useEffect often bad practice?** {#heading-why-is-useeffect-often-bad-practice}

Despite the above examples, `useEffect` is often used to fetch data. While this can be accomplished with the hook, there are a couple of downsides to this:

* Lots of boilerplate code for `isLoading` and data setting
    
* Difficult to cache or preload data
    
* If you’re using Server Components, you could be fetching them on the server instead
    
* Waterfall-like rendering and loading spinner hell - you fetch data in a parent, but the child component relies on that data, so you display a loading spinner temporarily, and this goes on
    

Luckily, dedicated tools exist to solve this problem. You can simply perform the fetch inside your component if you’re using a framework that supports Server Components, such as Remix.

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://akoskm.com/the-ultimate-full-stack-framework-for-2024-remix">https://akoskm.com/the-ultimate-full-stack-framework-for-2024-remix</a></div>

If you’re doing things in a SPA style, you can use [TanStack Query](https://tanstack.com/query).

## **What are the limitations of useEffect?** {#heading-what-are-the-limitations-of-useeffect}

### Synchronous Callback {#heading-synchronous-callback}

The limitation people often run into is the callback not being async:

```typescript
useEffect(() => { // sync callback
  await // can't use await inside
}, []);
```

Which is a common problem if you’re using `useEffect` to fetch data. See the previous section of how you can do this better.

However, if you still want to go for the data-fetch inside `useEffect` and want to use async/await you can do it like this:

```typescript
useEffect(() => {
  async function fetchRoom() {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`);
    const roomData = await response.json();
    if (!abort) {
      setRoomName(roomData.name);
    }
  }
  let abort = false;
  fetchRoom(); // call the async function
  return () => {
    abort = true;
  }
}, [roomId]);
```

### Comparison {#heading-comparison}

React uses [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to compare values with their previous values inside the dependency array. This can lead to all kind of limitations if you want to use non-primitive types inside the dependency array, such as arrays or objects:

```javascript
useEffect(() => {
  // you might have the same objects inside your rooms array, but the 
}, [rooms]);
```

Check out this [Codepen](https://codepen.io/akoskm/pen/ByaajGQ?editors=1112) I made for you, but here’s what you need to know

```typescript
const a = {};
const b = a;

console.log('{}, {}', Object.is({}, {})); // false
console.log('a, {}', Object.is(a, {})); // false
console.log('a, b', Object.is(a, b)); // true

const a1 = [a];
const a2 = [a];

console.log('array with same elements', Object.is(a1, a2)); // false
```

So basically, even if you’re having the same object (a and a) inside two different arrays, the array’s are different and will fail the equality check, causing the `useEffect` to rerun.

### ⚠️ Don’t do this {#heading-dont-do-this}

Unfortunately, a common theme I see in some React apps is simply stringifying the array and using the string version of it `[JSON.stringify(rooms)]` for the comparison. This is a much more common practice than it should be and indicates that you have a different problem to solve.

## **Does useEffect always cause a Rerender?** {#heading-does-useeffect-always-cause-a-rerender}

While `useEffect` itself doesn’t trigger a re-render, the operations you perform within it can indirectly cause re-renders.

For example, if you update the component’s state inside `useEffect`, it will trigger a re-render because state changes always lead to a new render cycle in React. Therefore, understanding how and when `useEffect` runs is crucial for avoiding performance bottlenecks by avoiding unnecessary re-renders in your application.

## **What causes useEffect to trigger?** {#heading-what-causes-useeffect-to-trigger}

When you pass a dependency array as the second argument to `useEffect`, it will only re-run the effect when one of the dependencies changes.

If you provide an empty array, the effect will only run once after the initial render, similar to `componentDidMount` in class components.

The official React documentation includes an [interactive playground](https://react.dev/reference/react/useEffect#examples-dependencies) to see how useEffect behaves when passing an array of dependencies, an empty array, and no dependencies at all.

## Conclusion {#heading-conclusion}

Here’s a recap of the most common mistakes I see with React developers using useEffect.

* Avoid treating `useEffect` as a lifecycle function; it's a conditional setup that React re-runs as needed.
    
* Ensure proper dependency management to prevent performance issues and infinite loops.
    
* Keep each `useEffect` focused on a single responsibility for better readability and maintenance.
    
* Implement correct cleanup code to manage connections, calculations, and event listeners.
    
* Use alternatives like Server Components or TanStack Query for data fetching to reduce boilerplate and improve performance.
    
* Be cautious with non-primitive dependencies in the dependency array to avoid unnecessary re-runs.
    
* Avoid improper practices like stringifying arrays for comparison, as it indicates a deeper problem.
