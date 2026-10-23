---
title: "How to test props in React Testing Library"
publishedAt: "2023-01-13T09:21:13.001Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "Mock the child with jest.mock and read the prop from the text. On Jest 30 the mock variable's name has to start with mock."
coverImage: "../../assets/covers/test-props-rtl.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Web Development"
    slug: "web-development"
  - name: "JavaScript"
    slug: "javascript"
  - name: "Jest"
    slug: "jest"
  - name: "Testing"
    slug: "testing"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
faq:
  - question: "How do you check a prop with React Testing Library?"
    answer: "Mock the child so it prints the prop, then getByText that string. On Jest 30.5.2 a factory of ({ profileId }) => a string worked."
  - question: "Why did Jest reject permissionsContainerMock?"
    answer: "A jest.mock factory may only read out-of-scope variables whose names start with mock. Rename it to mockPermissionsContainer."
  - question: "How do you assert an object prop without stringifying it?"
    answer: "Pass the props to a jest.fn(), then expect(mockFn).toHaveBeenCalledWith({ user }). mockImplementation can render the real child with jest.requireActual."
  - question: "How do you mock the child in Vitest?"
    answer: "Wrap the mock in vi.hoisted and return { default } from vi.mock. Vitest 5 clears mocks before each test, so the assertion goes in the test that renders."
---

Mock the child so the prop shows up as text, then `getByText` that string. React Testing Library will not hand you `props()` the way Enzyme did.

```tsx
jest.mock(
  "./PermissionsContainer",
  () =>
    ({ profileId }: { profileId: string }) =>
      `This is PermissionsContainer profileId:${profileId}`
);
```

```tsx
render(
  <Profile
    firstName="John"
    lastName="Doe"
    age={35}
    profileId="1234-fake-5678-uuid"
  />
);

expect(
  screen.getByText("This is PermissionsContainer profileId:1234-fake-5678-uuid")
).toBeInTheDocument();
```

That pair passed on Jest 30.5.2, React 19.3.1, and React Testing Library 16.3.3. Babel was compiling the TypeScript. The factory replaces the module with a function, and the default import in the parent receives that function.

Before React Testing Library, most of us were on Enzyme. You found the component and read whatever you wanted:

```tsx
const wrapper = mount(
  <div>
    <MyComponent includedProp="Success!" excludedProp="I'm not included" />
  </div>
);

const myComponent = wrapper.find(MyComponent);
expect(myComponent.props().includedProp).toBe("Success!");
```

You could also call `state()` and poke the instance. The power got out of control. Tests locked onto details, and a rename of an internal prop broke a suite that still described the same screen. I don't set that up in this post. The snippets below are the ones I re-ran. The old repository is still at [github.com/akoskm/test-react-props](https://github.com/akoskm/test-react-props).

## How do you mock a child and read a string prop?

`Profile` prints a name and hands `profileId` to `PermissionsContainer`. A normal `render` would run the child. The mock makes the child a string so the suite never executes that module.

```tsx
import PermissionsContainer from "./PermissionsContainer";

interface Props {
  firstName: string;
  lastName: string;
  age: number;
  profileId: string;
}

export default function Profile({
  firstName,
  lastName,
  age,
  profileId,
}: Props) {
  return (
    <div>
      <span>
        {firstName} {lastName}, {age}
      </span>
      <PermissionsContainer profileId={profileId} />
    </div>
  );
}
```

```tsx
import { render, screen } from "@testing-library/react";
import Profile from "./Profile";

jest.mock(
  "./PermissionsContainer",
  () =>
    ({ profileId }: { profileId: string }) =>
      `This is PermissionsContainer profileId:${profileId}`
);

test("renders the profileId the child received", () => {
  render(
    <Profile
      firstName="John"
      lastName="Doe"
      age={35}
      profileId="1234-fake-5678-uuid"
    />
  );

  expect(screen.getByText(/John Doe, 35/)).toBeInTheDocument();
  expect(
    screen.getByText(
      "This is PermissionsContainer profileId:1234-fake-5678-uuid"
    )
  ).toBeInTheDocument();
});
```

`screen.debug()` prints the string where the child used to be. The name and the age still come from `Profile`.

The matchers (`toBeInTheDocument`) show up after you import `@testing-library/jest-dom` from a file listed in `setupFilesAfterEnv`. The option name is `setupFilesAfterEnv`. I mistyped it once while re-running this and Jest ignored the file.

## How do you record an object prop and still render the child?

Printing the prop falls over when the value is an object. An `Immutable.Map` was the one that annoyed me in 2023: drop it into a template string and the DOM fills up with every field. A plain object does the same. Record the argument instead, and render the real child afterwards.

Jest 30 will not let the factory close over `permissionsContainerMock`. The name has to start with `mock`. With the old name the run stopped at:

```text
The module factory of `jest.mock()` is not allowed to reference any out-of-scope variables.
Invalid variable access: permissionsContainerMock
```

`mockPermissionsContainer` is allowed. Inside the test, `mockImplementation` can still load the real module and return it.

```tsx
const mockPermissionsContainer = jest.fn();

jest.mock(
  "./PermissionsContainer",
  () => (props: { user: User }) => mockPermissionsContainer(props)
);

test("records the object prop", () => {
  mockPermissionsContainer.mockImplementation(props => {
    const Actual = jest.requireActual("./PermissionsContainer").default;
    return <Actual {...props} />;
  });

  render(<UserCard user={user} />);

  expect(mockPermissionsContainer).toHaveBeenCalledWith({ user });
  expect(screen.getByText(/John Doe, 35/)).toBeInTheDocument();
  expect(
    screen.getByText("permissions for 1234-fake-4567-uuid")
  ).toBeInTheDocument();
});
```

`user` was `{ firstName: "John", lastName: "Doe", age: 35, profileId: "1234-fake-4567-uuid", email: "john.doe@example.com" }`. React 19 called the mock with that one argument. `toHaveBeenCalledWith({ user })` passed, and the real child rendered `permissions for 1234-fake-4567-uuid`.

The follow-up, where the mock prints every prop as text on purpose, is [How to Test Props in React with Jest](/how-to-test-props-in-react-with-jest/). Updating a prop on a component you have already mounted, without a mock, is [`rerender`](/how-to-use-rerender-in-react-testing-library/).

## How do you mock the child in Vitest?

Vitest hoists `vi.mock` above the imports, so a `const` declared in the test file does not exist yet when the factory runs. `vi.hoisted` is the slot that does. The module under test is ESM, so the factory returns `{ default }`. The `user` object is the one from the Jest test above.

```tsx
import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import UserCard, { type User } from "./UserCard";

const { permissionsContainerMock } = vi.hoisted(() => ({
  permissionsContainerMock: vi.fn(),
}));

vi.mock("./PermissionsContainer", async () => {
  const actual = await vi.importActual<typeof import("./PermissionsContainer")>(
    "./PermissionsContainer"
  );

  return {
    default: (props: { user: User }) => {
      permissionsContainerMock(props);
      const Actual = actual.default;
      return <Actual {...props} />;
    },
  };
});

test("records the object and still renders the child", () => {
  render(<UserCard user={user} />);

  expect(permissionsContainerMock).toHaveBeenCalledWith({ user });
  expect(screen.getByText(/John Doe, 35/)).toBeInTheDocument();
  expect(
    screen.getByText("permissions for 1234-fake-4567-uuid")
  ).toBeInTheDocument();
});
```

Vitest 5 clears mocks before each test. I checked with a spy that was called in one test and had `toHaveBeenCalledTimes(0)` in the next. Keep the `expect` in the test that calls `render`. The Vite setup around this file is in [How to test React apps with Vitest and Vite](/how-to-test-react-apps-with-vitest-and-vite/). A class on the node that received the prop is the other half of this, in [the className post](/how-to-test-a-classname-with-jest-and-react-testing-library/).

## FAQ

### How do you check a prop with React Testing Library?

Mock the child so it prints the prop, then getByText that string. On Jest 30.5.2 a factory of ({ profileId }) => a string worked.

### Why did Jest reject permissionsContainerMock?

A jest.mock factory may only read out-of-scope variables whose names start with mock. Rename it to mockPermissionsContainer.

### How do you assert an object prop without stringifying it?

Pass the props to a jest.fn(), then expect(mockFn).toHaveBeenCalledWith({ user }). mockImplementation can render the real child with jest.requireActual.

### How do you mock the child in Vitest?

Wrap the mock in vi.hoisted and return { default } from vi.mock. Vitest 5 clears mocks before each test, so the assertion goes in the test that renders.

Thanks for reading.

Ákos
