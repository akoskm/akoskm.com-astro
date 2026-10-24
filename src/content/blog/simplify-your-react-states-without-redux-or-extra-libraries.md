---
title: "Simplify Your React States (without redux or extra libraries)"
publishedAt: "2024-11-24T08:18:37.015Z"
updatedAt: "2024-11-24T08:54:29.819Z"
description: "You can simplify React states without redux, and I'll show you how to do it through a real-world example."
brief: "React states can get out of hand quickly.\nThe impact of a complex state doesn’t always break a component right away, but over time, it can lead to:\n\nbecoming out of sync as new states or edge cases are added\n\nincreased complexity, making the componen..."
readTimeInMinutes: 4
coverImage: "../../assets/posts/simplify-your-react-states-without-redux-or-extra-libraries/cover.png"
tags:
  - name: "React state management"
    slug: "react-state-management"
  - name: "react-state"
    slug: "react-state"
  - name: "best practices"
    slug: "best-practices"
  - name: "Web Development"
    slug: "web-development"
series: null
draft: false
---

React states can get out of hand quickly.

The impact of a complex state doesn’t always break a component right away, but over time, it can lead to:

* becoming out of sync as new states or edge cases are added
    
* increased complexity, making the component harder to understand and maintain
    

This is why it’s crucial to spot complex React states and learn to refactor them into clean, maintainable code. I believe it’s best done through examples, so this post is perfect for intermediate React developers looking to level up their state management skills.

As a general guideline, we often refer to the “Single Source of Truth” pattern, which really means storing the data you need in one place.

In this guide, we’ll walk through refactoring a real-world component, examining common anti-patterns, and transforming them into clean, efficient code. By the end, you’ll have practical knowledge you can apply to your own React projects.

# The Problem {#heading-the-problem}

A common scenario in React applications is a subscribers table with delete functionality.

You’ll likely encounter something similar when building email list management, user management, or subscription systems.

Inside such a table, you can do many things, but for the sake of simplicity, let’s assume that the only feature we care about is this:

Once the user presses delete for a line inside the table, the `onDelete` function is called with the email for that line.

The `SubscribersTable` component initially looked like this:

```typescript
const SubscribersTable: React.FC<{ 
  subscribers: Subscriber[];
  onDeleteSubscriber: (email: string) => void;
}> = ({ subscribers, onDeleteSubscriber }) => {
  const [confirmDeleteProps, setConfirmDeleteProps] = React.useState<{
    email: string;
    onConfirm: () => void;
  } | null>(null);

  const [selectedEmail, setSelectedEmail] = React.useState<string>();

  const handleDeleteClick = (email: string) => {
    setSelectedEmail(email);
    setConfirmDeleteProps({
      email,
      onConfirm: () => onDeleteSubscriber(email)
    });
  };

  return (
    <div>
      <Table
        data={subscribers}
        onDelete={handleDeleteClick}
      />
      
      {confirmDeleteProps && (
        <Dialog
          isOpen={true}
          title="Confirm Unsubscribe"
          message={`Are you sure you want to remove ${confirmDeleteProps.email} from your list?`}
          onConfirm={() => {
            confirmDeleteProps.onConfirm();
            setConfirmDeleteProps(null);
            setSelectedEmail(undefined);
          }}
          onCancel={() => {
            setConfirmDeleteProps(null);
            setSelectedEmail(undefined);
          }}
        />
      )}
    </div>
  );
};
```

I’ll give you some time to think about potential issues with the above component.

…

..

.

Let me give you a hint: one of the states is redundant.

…

..

.

Yep, it’s the email we clicked!

# Repeated States {#heading-repeated-states}

`setSelectedEmail` and `setConfirmDeleteProps` are essentially tracking the same thing: the email the user wanted to delete inside this table:

```typescript
<Table
  data={subscribers}
  onDelete={handleDeleteClick}
/>
```

And it’s not only that we track this information twice. We also do it in a complex manner:

```typescript
    setConfirmDeleteProps({
      email,
      onConfirm: () => onDeleteSubscriber(email)
    });
```

We create a new `onConfirm` function every time we initiate a delete action for a subscriber. Then, we would call this function when `confirm` is clicked inside the dialog:

```typescript
<Dialog
  isOpen={true}
  title="Confirm Unsubscribe"
  message={`Are you sure you want to remove ${confirmDeleteProps.email} from your list?`}
  onConfirm={() => {
    confirmDeleteProps.onConfirm();
    setConfirmDeleteProps(null);
    setSelectedEmail(undefined);
  }}
  ...
/>
```

Instead of all this, we could simply:

1. record the subscriber email that was clicked inside the table, just as before
    
2. remove the confirmDeleteProps state
    
3. initiate delete with `selectedEmail`
    

# Simplified React State - Single Source of Truth {#heading-simplified-react-state-single-source-of-truth}

Let’s make these modifications to the `SubscribersTable` component:

```typescript
const SubscribersTable: React.FC<{
  subscribers: Subscriber[];
  onDeleteSubscriber: (email: string) => void;
}> = ({ subscribers, onDeleteSubscriber }) => {
  const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null);

  return (
    <div>
      <Table
        data={subscribers}
        onDelete={setSelectedEmail}
      />
      
      <Dialog
        isOpen={selectedEmail !== null}
        title="Confirm Unsubscribe"
        message={`Are you sure you want to remove ${selectedEmail} from your list?`}
        onConfirm={() => {
          onDeleteSubscriber(selectedEmail!);
          setSelectedEmail(null);
        }}
        onCancel={() => setSelectedEmail(null)}
      />
    </div>
  );
};
```

This approach has several benefits:

1. `selectedEmail` is now the single source of truth
    
2. we reduce the risk of `setSelectedEmail` and the `email` saved inside the newly created `confirmDeleteProps.onConfirm` getting out of sync
    
3. we simplify the state management, improving the readability and simplicity of the code
    

# Conclusion {#heading-conclusion}

Remember, the goal of state management isn’t just to make things work - it’s to make them work in a clear, maintainable, and extensible way.

The next time you’re working with React state, ask yourself: “Is this the simplest possible state that could work?” Often, as we’ve seen here, the answer is “no” - and that’s your cue to refactor.
