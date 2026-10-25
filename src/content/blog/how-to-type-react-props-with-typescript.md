---
title: "How to type React Props with TypeScript"
publishedAt: "2023-01-06T06:39:01.015Z"
updatedAt: "2026-10-25T06:30:00.000Z"
description: "Type React props in TypeScript with an interface or a props type: optional defaults, children, event handlers, HTML attributes, and unions. React 19 types."
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

Type the props with an interface, then put that type on the function argument.

```tsx
interface Props {
  name: string;
  age: number;
}

function ProfileCard({ name, age }: Props) {
  return (
    <p>
      {name} is {age}
    </p>
  );
}
```

`<ProfileCard name="Ada" age={36} />` matches `Props`. Drop `name`, or pass `age="36"`, and TypeScript reports it on the call.

One field can stay inline, `function MyButton({ title }: { title: string })`. I name the object `Props` once there is a second field. Export it when another file extends it, and call that export `ProfileCardProps`.

I always set `"noImplicitAny": true`. Without `Props`, the function above is already an error. `name` and `age` are implicit `any`.

The samples here type-check on TypeScript 7.0.2 and `@types/react` 19.3.0, with React 19.3.1.

A `type` alias describes the same object.

```tsx
type Props = {
  name: string;
  age: number;
};

function ProfileCard({ name, age }: Props) {
  return (
    <p>
      {name} is {age}
    </p>
  );
}
```

Both describe one props object. Extend an `interface` when you add fields to an existing props type. Use a `type` for a union of shapes.

## Optional props and defaults

```tsx
interface Props {
  name: string;
  age?: number;
}

function ProfileCard({ name, age = 0 }: Props) {
  return (
    <p>
      {name} is {age}
    </p>
  );
}
```

`age?` lets the caller skip `age`. `<ProfileCard name="Ada" />` typechecks. Inside the function `age` is `number`, because `= 0` fills the gap.

The default has to fit the prop. `age = "unknown"` fails on that parameter:

`Type 'string' is not assignable to type 'number'.`

React 19 removed `defaultProps` from function components and points you at this parameter default. Class components still support `defaultProps`. The note is in the [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops).

## React.FC

You can type React props in a few ways. Not each way will provide you with an equal level of type safety.

`React.FC<Props>` types the props too.

```tsx
import React from "react";

interface Props {
  name: string;
  age: number;
}

const ProfileCard: React.FC<Props> = ({ name, age }) => {
  return (
    <p>
      {name} is {age}
    </p>
  );
};
```

Destructure `children` from `React.FC<{ title: string }>` and the compiler says `Property 'children' does not exist on type '{ title: string; }'`. You declare `children` on the props type yourself.

The gap around a bad default is still there.

```tsx
interface Props {
  name: string;
}

const ProfileCard: React.FC<Props> = ({ name = false }) => {
  return <ProfileName name={name} />;
};

function ProfileName({ name }: { name: string }) {
  return <span>{name}</span>;
}
```

You might expect `name = false` to fail the TypeScript compilation, but it won't. Inside `ProfileCard`, `name` is `string | boolean`. `ProfileName` asks for a `string`, so the error shows up on `<ProfileName name={name} />`:

`Type 'string | boolean' is not assignable to type 'string'.`

Put the type on the argument and the bad default fails on its own line:

```tsx
function ProfileCard({ name = false }: Props) {
  return <ProfileName name={name} />;
}
```

`Type 'boolean' is not assignable to type 'string'.`

I always prefer `props: Props`.

## The children prop

```tsx
import type { PropsWithChildren, ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

function Card({ title, children }: Props) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

`ReactNode` is what you can put between the tags. Text, numbers, elements, fragments, arrays of those, and `null` all fit. `<Card title="Hi">Ada</Card>` typechecks.

`ReactElement` is only an element. The same string child fails, because `"Ada"` is text.

`PropsWithChildren` adds an optional `children` onto a props type you already have:

```tsx
type PanelProps = PropsWithChildren<{
  title: string;
}>;

function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

`<Panel title="Hi" />` typechecks. `children` on `PanelProps` is `ReactNode | undefined`. When the component always renders a child, write `children: ReactNode` on the interface. The call with no child then fails.

## Event handler props

```tsx
import type { ChangeEvent, MouseEventHandler } from "react";

interface Props {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: MouseEventHandler<HTMLButtonElement>;
}

function SearchBox({ value, onChange, onClear }: Props) {
  return (
    <>
      <input value={value} onChange={onChange} />
      <button type="button" onClick={onClear}>
        Clear
      </button>
    </>
  );
}
```

On `onChange`, `event.currentTarget.value` is a `string`. `MouseEventHandler<HTMLButtonElement>` is the function type React already uses for a button's `onClick`.

## HTML element props

`Button` adds a `loading` flag and keeps the attributes of `<button>`.

```tsx
import type { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<"button"> {
  loading?: boolean;
}

function Button({ loading = false, children, disabled, ...rest }: Props) {
  return (
    <button {...rest} disabled={loading || disabled}>
      {loading ? "Working" : children}
    </button>
  );
}
```

`ComponentPropsWithoutRef<"button">` is the button attributes. `<Button ref={null}>` fails with `Property 'ref' does not exist on type 'IntrinsicAttributes & Props'`. `ref` lives on `ComponentProps<"button">`. React 19 passes `ref` as a normal prop, so extend that type when `Button` forwards the ref to the DOM node.

`<Button loading type="submit" onClick={() => undefined}>Save</Button>` typechecks. `loading` is pulled out before `...rest`, and the DOM button receives the remaining attributes.

`ComponentProps<typeof Card>` reads the props off a component that never exported an interface.

## Passing a component as a prop

```tsx
import type { ComponentType, ReactNode } from "react";

interface IconProps {
  size: number;
}

interface Props {
  icon: ComponentType<IconProps>;
  label: string;
}

function IconButton({ icon: Icon, label }: Props) {
  return (
    <button type="button">
      <Icon size={16} />
      {label}
    </button>
  );
}
```

`ComponentType<IconProps>` is a component that accepts `size`. The parent passes `icon={CheckIcon}`, and `IconButton` creates the element. When the parent already has an element, the prop type is `ReactNode`.

## Generic props

```tsx
import type { ReactNode } from "react";

interface Props<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function List<T extends { id: string }>({ items, renderItem }: Props<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

```tsx
<List
  items={[{ id: "1", name: "Ada" }]}
  renderItem={person => person.name}
/>
```

`T` comes from `items`. `person.name` typechecks, and `person.missing` is an error.

## When the props have more than one shape

```tsx
type Props =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; name: string; age: number };

function Profile(props: Props) {
  if (props.status === "error") return <p>{props.message}</p>;
  if (props.status === "ready") {
    return (
      <p>
        {props.name} is {props.age}
      </p>
    );
  }
  return <p>Loading</p>;
}
```

`<Profile status="error" />` fails, because that branch requires `message`. `<Profile status="ready" name="Ada" age={36} />` is the ready branch. Make every field optional and that error call typechecks. The union above keeps `message` required on the error branch. A union like this is a `type`.
