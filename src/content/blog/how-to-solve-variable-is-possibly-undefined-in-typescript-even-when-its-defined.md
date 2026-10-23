---
title: "How to solve ”variable is possibly undefined” in TypeScript - even when it’s defined"
publishedAt: "2023-04-01T15:08:04.644Z"
updatedAt: "2026-10-23T12:00:00.000Z"
description: "Guard an optional value, or pass a required argument. TypeScript 7 still reports possibly undefined. The ! operator only hides it."
coverImage: "../../assets/covers/typescript-possibly-undefined.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "TypeScript"
    slug: "typescript"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Web Development"
    slug: "web-development"
  - name: "Code Quality"
    slug: "code-quality"
series: null
draft: false
faq:
  - question: "Why does TypeScript say a variable is possibly undefined when I already checked it?"
    answer: "The check narrowed the value in that block. A nested function that closes over the parameter still sees the old type. Put the guard inside that function, or pass a required argument."
  - question: "Does noUncheckedIndexedAccess change array access?"
    answer: "Yes. With the flag on, items[0] is T or undefined. strict does not enable the flag. tsc --init has included it since TypeScript 5.9."
  - question: "Should I use the non-null assertion?"
    answer: "Not for a value that can be missing. The ! operator hides the error and leaves the crash. Narrow with a guard."
  - question: "Why is Map.get possibly undefined?"
    answer: "Map.get returns V or undefined because the key might be missing. array.find does the same when no element matches. Check the result before you read a property."
---

TypeScript reports `'players' is possibly 'undefined'` when the type still includes `undefined` and you use the value anyway. Guard it before you read it, or pass a required argument into the function that needs it.

```ts
interface Player {
  id: number;
  name: string;
}

function welcome(players: Player[] | undefined) {
  if (!players || players.length === 0) return "No players";
  const names = players.map(player => player.name).join(", ");
  return `Welcome ${names}`;
}
```

`players!` does not fix the bug. It tells the compiler to stop looking.

Readable code has always been one of the highest importance in my teams.

But it's not reduced to "correctly" naming variables.

We care about patterns, nesting, and interaction between different parts of the system - everything that makes navigating the codebase easier.

Nesting is one of those things that I always approach with:

_Ughhh, let's go a level deeper_

It's one of the overused things in React, and it usually appears as a byproduct of using the ternary operator.

## Why does TypeScript say the object is possibly undefined?

It is not uncommon to find components like this:

```tsx
interface BoardProps {
  players?: Player[];
}

export default function Board({ players }: BoardProps) {
  return (
    <p>
      {players && players.length > 0
        ? players.length > 1
          ? `Welcome our new players: ${players
              .map(({ name }) => name)
              .join(", ")}!`
          : `Welcome our new player: ${players[0].name}!`
        : "No Players"}
    </p>
  );
}
```

This code works perfectly fine yet makes you question many things. And it's also super ugly...

The ternary operator inevitably leads to nesting, and more ternary operators lead to more nesting.

`players?: Player[]` is the line that matters. The `?` means a read of `players` has type `Player[] | undefined`. TypeScript 7.0 turns `strict` on by default, and `strict` includes `strictNullChecks`. That check produces `'players' is possibly 'undefined'`.

Index access uses the other wording, `Object is possibly 'undefined'`. `Map.get` and `find()` do too.

I rechecked the samples on TypeScript 7.0.2, the stable compiler. 7.1 is still a beta.

## Why doesn't a check outside the function count?

We decide to refactor the above code and create separate functions to avoid using the ternary operators:

```ts
function renderWelcome() {
  if (players.length > 1) {
    const names = players.map(({ name }) => name).join(", ");
    return `Welcome our new players ${names}!`;
  }
  return `Welcome our new player: ${players[0].name}!`;
}
```

Even though we check that `players` is defined before entering `renderWelcome`, TypeScript still warns us.

![TypeScript error: players is possibly undefined](https://cdn.hashnode.com/res/hashnode/image/upload/v1680359362863/b176909b-1cba-4a4a-bbb2-f01d12aebbea.png)

The behavior makes sense to me because nothing prevents `renderWelcome` from being called without wrapping it with a check. That path throws at runtime.

A nested function does not get a free pass. On TypeScript 7.0.2, this still errors after the outer check:

```ts
function Board({ players }: BoardProps) {
  if (!players) return "No Players";

  function renderWelcome() {
    return players.length; // 'players' is possibly 'undefined'
  }

  return renderWelcome();
}
```

The check narrowed `players` in `Board`. The inner function closes over the parameter, and that parameter is still `Player[] | undefined`.

Copy the narrowed value into a const and the inner function can see the const:

```ts
if (!players) return "No Players";
const list = players;

function renderWelcome() {
  return list.length;
}
```

`list` is `Player[]`. `players` is not, once you step into another function.

When that function is called from more than one place, pass `list` in. I wrote that pattern up in [The right way to create utility functions in TypeScript](/the-right-way-to-create-utility-functions-in-typescript/).

## How do you narrow an optional property?

There are a couple of ways to fix the original component:

1. Move the `if (players)` check inside `renderWelcome`.
2. Pass `players` as an argument and make that argument required.
3. Create a `PlayerWelcome` component whose props require the array.

`players!` also compiles. That one is lazy TypeScript. 😄

I'll go with option 2, because to me it looks the best in React. Optional props have a few shapes worth knowing, and I covered the ones I use in [How to type React Props with TypeScript](/how-to-type-react-props-with-typescript/).

All you have to do is create a component where `players` is not optional (note the missing `?`):

```tsx
interface PlayerWelcomeProps {
  players: Player[];
}

function PlayerWelcome({ players }: PlayerWelcomeProps) {
  if (players.length > 1) {
    const names = players.map(({ name }) => name).join(", ");
    return <p>Welcome our new players {names}!</p>;
  }

  const player = players[0];
  if (!player) return <p>No players</p>;
  return <p>Welcome our new player: {player.name}!</p>;
}
```

TypeScript will be happy with this code because `players` is guaranteed to be there. The check on `players[0]` is for the flag in the next section. Without that flag, `players[0].name` type-checks on its own.

![PlayerWelcome type-checks once players is required](https://cdn.hashnode.com/res/hashnode/image/upload/v1680359574461/4f948c42-a8d5-41a1-8e74-5a4e87e2346e.png)

The parent keeps the optional prop and renders the child only when the array exists:

```tsx
export default function Board({ players }: BoardProps) {
  if (!players || players.length === 0) return <p>No Players</p>;
  return <PlayerWelcome players={players} />;
}
```

After `if (!players) return`, `players` is `Player[]` for the rest of `Board`. Passing it into `PlayerWelcome` is what makes the guarantee stick.

## What about array indexes, Map.get, and find()?

`noUncheckedIndexedAccess` is not part of `strict`. TypeScript leaves it off unless you set it. A fresh `tsc --init` has turned it on since TypeScript 5.9, in the same file as `strict: true`. If your config came from that template, `players[0]` is `Player | undefined` even when `players` is `Player[]`. The message is `Object is possibly 'undefined'`.

```ts
function firstName(players: Player[]) {
  const player = players[0];
  if (!player) return "No players";
  return player.name;
}
```

`find()` has always returned `T | undefined`. The element might not be in the list.

```ts
function nameForId(players: Player[], id: number) {
  const player = players.find(item => item.id === id);
  if (!player) return "Missing player";
  return player.name;
}
```

`Map.get` works the same way. The key can be missing, so the return type is `Player | undefined`.

```ts
function nameFromMap(byId: Map<number, Player>, id: number) {
  const player = byId.get(id);
  if (!player) return "Missing player";
  return player.name;
}
```

A type that already includes `undefined` for no good reason makes every one of these checks noisier. I wrote about that in [Stop Making Your TypeScript Types So Broad](/stop-making-your-typescript-types-so-broad/).

## When is a non-null assertion the wrong fix?

`players!` and `players[0]!` compile. The emitted JavaScript does not change, so an empty list still throws when something reads `.name`.

Use `!` when you can point at the invariant the type system cannot see, and leave a comment that says what it is. A players array that starts empty is not that case. The guard is shorter than the excuse.

Not a type error you silence. A missing value you handle.

## FAQ

### Why does TypeScript say a variable is possibly undefined when I already checked it?

The check narrowed the value in that block. A nested function that closes over the parameter still sees the old type. Put the guard inside that function, or pass a required argument.

### Does noUncheckedIndexedAccess change array access?

Yes. With the flag on, items[0] is T or undefined. strict does not enable the flag. tsc --init has included it since TypeScript 5.9.

### Should I use the non-null assertion?

Not for a value that can be missing. The ! operator hides the error and leaves the crash. Narrow with a guard.

### Why is Map.get possibly undefined?

Map.get returns V or undefined because the key might be missing. array.find does the same when no element matches. Check the result before you read a property.

You just learned how you could both improve the readability of your code and create a nice component separation in React when using TypeScript, without dirty tricks such as the `!`.

Thanks for reading my article!

If you liked it, share it with someone who would find it helpful and give the article a ❤️!

Until next time,

Ákos
