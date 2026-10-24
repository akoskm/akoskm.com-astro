---
title: "How to add TypeScript types to useReducer"
publishedAt: "2022-07-04T08:03:00.657Z"
updatedAt: "2022-07-30T06:59:04.123Z"
description: "useReducer is a great way to abstract some of your application's complexity in React. In this post, we're enhancing our reducers with TypeScript types!"
brief: "useReducer is a great way to abstract some of your application's complexity in React.\nIn this post, I'm going to show you how you can add TypeScript types to reducers and save yourself hours of debugging time! 🥳\nAs your application grows you start m..."
readTimeInMinutes: 3
coverImage: "../../assets/posts/how-to-add-typescript-types-to-usereducer/cover.jpeg"
tags:
  - name: "JavaScript"
    slug: "javascript"
  - name: "React"
    slug: "reactjs"
  - name: "ReactHooks"
    slug: "reacthooks"
  - name: "Web Development"
    slug: "web-development"
  - name: "2Articles1Week"
    slug: "2articles1week"
series: null
draft: false
---

useReducer is a great way to abstract some of your application's complexity in React.
In this post, I'm going to show you how you can add TypeScript types to reducers and save yourself hours of debugging time! 🥳

As your application grows you start moving from `useState` to `useReducer` that's going to hide some of the complexity of your app. However, without the correct typings, you can misuse the `dispatch` function of `useReducer` and run into unexpected errors.

Imagine having a login form which state is managed by this reducer:


```js
function authReducer(state, action) {
  switch (action.type) {
    case "success":
      return { success: true, username: action.value, error: "" }
    case "failure":
      return { success: false, username: "", error: action.value }
    default:
      throw Error()
  }
}
``` 

The way how you would use this reducer in your React app is the following:

```jsx
const [state, dispatch] = useReducer(authReducer)

function submit(data) {
  try {
    const response = await axios.post("/api/login", { data });
    dispatch({
      type: "success",
      value: response.data.user,
    });
  } catch (error) {
    dispatch({
      type: "failure",
      value: error.message,
    });
  } 
}
```

This works, however, without using types nothing prevents you from accidentally doing:

```js
dispatch({
  type: "failure",
  value: response.data.user,
})
```

This is why I like to introduce types to my reducers as soon as possible so such errors are caught at compile time. Let's do that with our example:

```ts
type User = {
  id: string;
  username: string;
}

export type AuthState = {
  success: boolean;
  user: User | null;
  error: string;
}

export type AuthAction = {
  type: "success" | "failure";
  value: User | string;
}

export function authReducer(state: AuthState, action: AuthAction) {
  switch (action.type) {
    case "success":
      return { success: true, user: action.value, error: "" }
    case "failure":
      return { success: false, user: null, error: action.value }
    default: throw Error()
  }
}
```

while we typed our reducer now, because of how we typed the action:

```ts
type AuthAction = {
  type: "success" | "failure";
  value: User | string;
}
```

it's still possible to send the wrong value to the wrong type of action ie. an error message for the "success" type:

```js
dispatch({
  type: "success",
  value: "Something went wrong",
})
```

So let's be more specific about the specific value a type accepts:

```ts
type AuthAction =
  | {
    type: "success";
    value: User;
  }
  | {
    type: "failure";
    value: string;
  }
```

Now let's type the reducer usage in our React app:

```jsx
import { Reducer } from "react";
import { authReducer, authState, AuthState, AuthAction } from './auth_reducer';

const [state, dispatch] = useReducer<
  Reducer<AuthState, AuthAction>
>(authReducer, authState)

function submit(data) {
  try {
    const response = await axios.post("/api/login", { data });
    dispatch({
      type: "success",
      value: response.data.user,
    });
  } catch (error) {
    dispatch({
      type: "failure",
      value: error.message,
    });
  } 
}
```

Now if you try to call the "success" type with an incorrect value:

```js
dispatch({
  type: "success",
  value: "Something went wrong",
})
```

You get the following error from TypeScript:

```
Type 'string' has no properties in common with type 'User'.
```

Congratulations, you just added TypeScript types to your reducer, making it more resilient and straightforward to use! 🙌
