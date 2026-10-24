---
title: "How to type React Props with TypeScript"
publishedAt: "2023-01-06T06:39:01.015Z"
description: "Two ways to type React component props in TypeScript, and which one stays safe when noImplicitAny is on."
brief: "Typing React Props with TypeScript can be done in different ways, but not each way will provide you with an equal level of type safety.\nFirst, let's take a look at a simple component we'll use to demonstrate the two methods, but without typing the pr..."
readTimeInMinutes: 2
coverImage: "../../assets/posts/how-to-type-react-props-with-typescript/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "TypeScript"
    slug: "typescript"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Web Development"
    slug: "web-development"
series: null
draft: false
---

Typing React Props with TypeScript can be done in different ways, but not each way will provide you with an equal level of type safety.

First, let's take a look at a simple component we'll use to demonstrate the two methods, but without typing the props first:

![](../../assets/posts/how-to-type-react-props-with-typescript/6499dde6-cd19-463a-8002-d6639cdd22fd.png)

I always set `"noImplicitAny": true,` so my editor warns me about the untyped props.

Let's type them with React's `FC` interface.

## React.FC {#heading-reactfc}

`React.FC` is a generic type in the React module that defines a functional component in TypeScript. It is a shorthand for describing a functional component that has a prop type.

In our example, `ProfileCard` is a functional component that expects to receive props with a `name` string and an `age` number. These props are typed using the `Props` interface, and the component is typed as `React.FC<Props>`, which specifies that it is a functional component with the specified prop types:

![](../../assets/posts/how-to-type-react-props-with-typescript/aedf5c32-fe73-4d12-8835-bffefdde4ba4.png)

As we see, the errors disappeared because through `React.FC<Props>`, we specified the types for both the `name` and `age` props.

## props: Prop {#heading-props-prop}

Another, even more straightforward way to type React props is to specify the object type inside the function's signature.

Below we're simply telling react that this object has a specific type:

![](../../assets/posts/how-to-type-react-props-with-typescript/ac40ceed-b110-46b1-9e84-e56b3edc0794.png)

Now let's see the differences between the two regarding type safety.

# Differences in type safety {#heading-differences-in-type-safety}

When using `React.FC`, if you define a default value with a different type than the type in `Props`, it'll merge the two types and assign that as the new type for the prop.

You might expect the below code to fail the TypeScript compilation, but it won't.

Here's the new type `React.FC` created for `name`:

![](../../assets/posts/how-to-type-react-props-with-typescript/ab7a5b6a-014d-4b59-bca2-ccf01c5d82ef.png)

However, if you use the `props: Prop` method to type your props, you get an error right away:

![](../../assets/posts/how-to-type-react-props-with-typescript/fd4917de-77b9-4493-a940-a4446f8943c0.png)

# Conclusion {#heading-conclusion}

Because of this difference, I always prefer the `props: Prop` way to define props in React.

But keep in mind, if you are using TypeScript in your entire codebase, a wrongly typed default value might pop up an error in the component that ends up using it.

Here's an example of that:

![](../../assets/posts/how-to-type-react-props-with-typescript/5b5308fb-49f7-404e-a04a-95f4f6238141.png)

The TypeScript compiler warns us that `ProfileName` expects a name with the type of `string` and not with the type of `string | boolean`.
