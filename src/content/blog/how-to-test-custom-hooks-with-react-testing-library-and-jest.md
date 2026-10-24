---
title: "How to Test Custom Hooks with React Testing Library and Jest"
publishedAt: "2023-01-25T07:03:48.904Z"
updatedAt: "2023-06-14T10:08:48.987Z"
description: "Learn how to test your custom React Hooks with React Testing Library and Jest. You'll find an interactive Codesandox at the end of the post."
brief: "If you've been building React applications for some time now, custom hooks are probably a mechanism you've already come across.\nThey help encapsulate custom logic in reusable functions.\nThey behave like other React components, rerender when props cha..."
readTimeInMinutes: 4
coverImage: "../../assets/posts/how-to-test-custom-hooks-with-react-testing-library-and-jest/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Testing"
    slug: "testing"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Testing Library"
    slug: "testing-library"
series:
  name: "Testing React"
  slug: "react-testing"
draft: false
---

If you've been building React applications for some time now, custom hooks are probably a mechanism you've already come across.

They help encapsulate custom logic in reusable functions.

They behave like other React components, rerender when props change, and you can use other hooks such as `useEffect` or `useMemo` inside of them.

You can import these custom hooks into other React components and reuse them across your application.

Sometimes, however, hooks can get complicated, and testing them as part of our component might not be the best solution.

Consider this `PermissionContainer` component that renders the users' permissions.

Notice how it shows a loading state returned from `usePermissionsHook`.

```typescript
import { usePermissionsHook } from "./usePermissionsHook";

interface Props {
  profileId: string;
}

const PermissionsContainer = ({ profileId }: Props) => {
  const { permissions, isLoading } = usePermissionsHook(profileId);

  if (isLoading) return <div>Loading Permissions</div>;

  return (
    <ul>
      {permissions.map((p: string) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
};

export default PermissionsContainer;
```

The `usePermissionsHook` hook works like this:

```typescript
import { useEffect, useState } from "react";
import fetchPermissions from "./fakeApi";

export function usePermissionsHook(profileId: string) {
  const [permissions, setPermissions] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const data = await fetchPermissions(profileId);
      setPermissions(data);
      setIsLoading(false);
    }
    fetch();
  }, [profileId]);

  return { permissions, isLoading };
}
```

In your unit test for `PermissionsContainer` you might want to test the list of permissions that get rendered and maybe some interaction on them.

But what if you wanted to make sure that the `isLoading` flag was returned by `usePermissionsHook` works correctly - initially, it's true, and when data arrives from `fetchPermissions` it flips to false - you might want to focus on testing the hook only.

`testing-library` exposes [`renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) that helps you test your hooks independently from any component.

This can be super handy if your hook contains a ton of logic, receives lots of arguments, and returns multiple variables and functions.

`renderHook` receives a renderer function where you can specify how you want to call the hook. If your hook doesn't receive any arguments, you can pass it directly to `renderHook` like this:

```typescript
renderHook(useMyBestHook);
```

And if you want to pass some arguments to it, you can call it like:

```typescript
renderHook(() => useMyBestHook('akoskm.com'));
```

`renderHook` also receives a second argument where you can pass various options, such as initial parameters for your hook. We won't be using `options` here, but make sure to check out the API [here](https://testing-library.com/docs/react-testing-library/api/#renderhook-options).

Knowing this, we can use `renderHook` to write a unit test for `usePermissionsHook`:

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { usePermissionsHook } from "./usePermissionsHook";

describe("usePermissionsHook", () => {
  test("returns isLoading true while the component is loading", async () => {
    const { result } = renderHook(() =>
      usePermissionsHook("1234-fake-4567-uuid")
    );
    expect(result.current.isLoading).toEqual(true);
    expect(result.current.permissions).toEqual([]);

    await waitFor(() =>
      expect(result.current.isLoading).toEqual(false)
    );

    expect(result.current.permissions).toEqual(["read", "write", "create"]);
  });
});
```

Now let's go over this test line by line:

```typescript
const { result } = renderHook(() =>
  usePermissionsHook("1234-fake-4567-uuid")
);
```

Here we render the hook and pass any necessary props it expects. In our case, that's the `profileId`.

`renderHook` as a result, returns an object with two properties:

* `result`: contains `current` that contains the latest return value of the hook
    
* `rerender`: rerenders the same hook with different props
    

Initially, before the response arrives, right after calling the hook, the `isLoading` the flag should be true, so let's check that:

```typescript
expect(result.current.isLoading).toEqual(true);
expect(result.current.permissions).toEqual([]);
```

Using `waitFor` jest waits for the `isLoading` flag to turn false:

```typescript
await waitFor(() =>
  expect(result.current.isLoading).toEqual(false)
);
```

and when this is done, the updated permissions list should be already returned by the hook so we can check that:

```typescript
expect(result.current.permissions).toEqual(
  ["read", "write", "create"]
);
```

We just tested our hook independent from any wrapping components and verified that initially, its loading state indicator `isLoading` is true, and the list of permissions is empty.  
Once the response arrives, it turns `isLoading` to false and returns the `permissions`.

This is how you test your custom hooks with `testing-library` and `jest`!

If you want to play around with `renderHook`, I created an interactive demo for you in CodeSandbox:

<iframe src="https://codesandbox.io/embed/distracted-cdn-lbdmk9?fontsize=14&hidenavigation=1&module=%2Fsrc%2FPermissionsContainer%2FusePermissionsHook.test.ts&previewwindow=tests&theme=dark&view=editor" style="width:100%;height:500px;border:0;border-radius:4px;overflow:hidden" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe>

Thanks for reading, and see you in the next one!
