---
title: "How to Test Props in React with Jest"
publishedAt: "2023-04-12T07:59:07.072Z"
updatedAt: "2023-10-18T16:16:44.406Z"
description: "Mock a child React component with Jest, render its props as text, and assert that the parent passed the props you expect."
brief: "In our previous article, we explored how we can test React Component props by simply mocking the component and turning the props into strings:\njest.mock(\"./Profile\", () => ({ profileId }) =>\n  `This is Profile profileId:${profileId}`\n);\n\nAnd then, in..."
readTimeInMinutes: 3
coverImage: "../../assets/posts/how-to-test-props-in-react-with-jest/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Jest"
    slug: "jest"
  - name: "JavaScript"
    slug: "javascript"
  - name: "Web Development"
    slug: "web-development"
  - name: "Testing"
    slug: "testing"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
---

In our [previous article](https://akoskm.com/how-to-test-props-in-react-testing-library), we explored how we can test React Component props by simply mocking the component and turning the props into strings:

```typescript
jest.mock("./Profile", () => ({ profileId }) =>
  `This is Profile profileId:${profileId}`
);
```

And then, in our tests, checking if that string is appearing in the DOM:

```typescript
  test("renders Container with the correct props", () => {
    renderProfile();
    expect(
      screen.getByText(
        "This is Profile profileId:1234-fake-5678-uuid"
      )
    ).toBeInTheDocument();
  });
```

> 2023 October update: the old article now has been updated with [a new section](https://akoskm.com/how-to-test-props-in-react-testing-library#heading-testing-objects-props-without-mocking-the-component) showing a new way to test complex props without mocking the original component. I also added a GitHub repo demonstrating this in action.

This is one of the simplest ways to test components where the props are primitives (strings, numbers, booleans) or translate well into strings.

But how would this assert look like if the Profile component received an `Immutable.List` with hundreds of elements or a huge `Immutable.Map` with 150 keys?

The above strategy doesn't scale well and stops working for certain patterns.

We usually run into this when testing a container component:

The container component fetches data and receives an object that the container uses to render other components.

If you're new to this pattern, they usually look like this:

```typescript
import Profile from "./Profile";
import fetchUserData from './services';

export default function App() {
  const { data, loading } = fetchUserData();

  if (loading) return null;

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Profile user={data.user} />
    </div>
  );
}
```

And let's assume that `fetchUserData` in `data` returns an `Immutable` object.

Small `Immutable` objects can be stringified, so if you mock the Profile component the same as we did earlier.

```typescript
jest.mock("./Profile", () => ({ user }) =>
  `This is Profile user:${user}`
);
```

and your profile only contains a few keys, in the DOM, we'll get the following:

```typescript
Map { "firstName": "John", "lastName": "Doe", "age": 35, "profileId": "1234-fake-4567-uuid" }
```

So far, so good. You'll have no issue asserting the presence of such text in the DOM.

But as we pointed out, this approach stops scaling as soon as your object grows in size (usually when you start using fixtures in your tests) or when you can't assert the stringified version of the prop in the DOM.

To solve this limitation of stringifying the props and swapping out the return value of `./Profile` for a simple string, you could return a *mock function* instead, that you can do assertions later on:

```typescript
const mockProfile = jest.fn().mockReturnValue(<>mock Profile</>);
jest.mock("./Profile", () => (props: any) => mockProfile(props));
```

With `mockProfile` now you can do checks beyond checking the stringified version of the prop that was passed to your component:

```typescript
test("renders app", () => {
  const user = Immutable.Map({
    firstName: "John",
    lastName: "Doe",
    age: 35,
    profileId: "1234-fake-4567-uuid"
  });

  jest.spyOn(fetchUserData).mockReturnValue({ data: { user }});

  render(<App />);

  expect(screen.getByText("Hello CodeSandbox")).toBeInTheDocument();
  expect(mockProfile).toHaveBeenCalledWith({
    user
  });
});
```

In the above test, we spy on `fetchUserData` and return a specific user object using `mockProfile`.

Now we can assert that our component receives a user prop, that's an `Immutable.Map` that looks exactly like the one `fetchUserData` passed down to our component.

This is how you test props in React with Jest if the object you want to assert is too big to have the stringified version checked or it simply doesn't stringify well.

Thanks for reading!

Until next time,

Akos
