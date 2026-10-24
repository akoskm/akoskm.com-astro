---
title: "How to handle multiple form actions in Remix"
publishedAt: "2023-12-07T08:30:10.603Z"
updatedAt: "2023-12-09T06:13:51.530Z"
description: "Add name=\"intent\" and value=\"actionName\" to the button that submits the form. In the action, use formData.get(\"intent\") to learn which button was clicked."
brief: "Form actions in Remix are handled by the action function that runs on your server. They work very much like loaders, except they're called when you make a DELETE, PATCH, POST, or PUT to your route.\nRemix's action/loader structure is incredibly straig..."
readTimeInMinutes: 3
coverImage: "../../assets/posts/how-to-handle-multiple-form-actions-in-remix/cover.png"
tags:
  - name: "Remix"
    slug: "remix"
  - name: "React"
    slug: "reactjs"
  - name: "Full Stack Development"
    slug: "full-stack-development"
  - name: "Web Development"
    slug: "web-development"
  - name: "Beginner Developers"
    slug: "beginners"
series:
  name: "Remix"
  slug: "remix"
draft: false
---

Form actions in Remix are handled by the `action` function that runs on your server. They work very much like loaders, except they're called when you make a `DELETE`, `PATCH`, `POST`, or `PUT` to your route.

Remix's action/loader structure is incredibly straightforward and easy to grasp! If you've got some experience with data flow in client-server applications, you'll find this a piece of cake. But before we answer how we can handle multiple form actions in Remix, let's understand how the data flow works.

### The Remix Fullstack Data Flow {#heading-the-remix-fullstack-data-flow}

In the Remix Fullstack Data Flow, the `loader` fetches data from the backend and passes that data to your component. The `action` passes your component data to the backend. After the `action` finishes, loaders are revalidated and return the current state of the backend to the component.

![](/assets/posts/how-to-handle-multiple-form-actions-in-remix/7f4b8129-dc69-465d-bd72-17d0136a282c.gif)

This is how Remix keeps your backend and frontend data in sync without any additional code to do refetches.

Also, in Remix each route has one `loader` and one `action`.

The issue arises when, on the client, you want to handle different functionalities, and each functionality would require a different action on the backend.

Let's take a look at this simple Todo app:

```typescript
export async function loader() {
  return json({ todos: getTodos() });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { todo } = Object.fromEntries(formData.entries());
  await addTodo(todo);
  return json({ ok: true });
}

export default function Index() {
  const { todos } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl pb-10">Todos</h1>
      <Form method="post" className="flex flex-col gap-4">
        <label htmlFor="todo">Title</label>
        <input type="text" name="todo" id="todo" autoComplete="off" />
        <button>Add</button>
      </Form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="text-lg pt-5">
            ✔️ {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

There is nothing fancy here, just an input and a button to submit a todo item to your list.

## The problem with multiple actions {#heading-the-problem-with-multiple-actions}

Let's say we want to extend the functionality with a button to remove all items with a single click:

```typescript
<Form method="post" className="flex flex-col gap-4">
  <label htmlFor="todo">Title</label>
  <input type="text" name="todo" id="todo" autoComplete="off" />
  <button>Add</button>
  <button>Clear</button>
</Form>
```

But because we have only one `action` handler, it doesn't matter which of these buttons we click, the action result is the same:

![](/assets/posts/how-to-handle-multiple-form-actions-in-remix/607f077e-a156-430e-8aa6-4e32fc6ba3d5.gif)

## The solution {#heading-the-solution}

To work around this, we'll add two new attributes to each of these buttons: `name` and `value`.

I like to use `name="intent"` (reminds me of Android's Intent) and a custom `value` describing the action we want to run:

```typescript
<Form method="post" className="flex flex-col gap-4">
  <label htmlFor="todo">Title</label>
  <input type="text" name="todo" id="todo" autoComplete="off" />
  <button name="intent" value="add">Add</button>
  <button name="intent" value="clear">Clear</button>
</Form>
```

Now, whenever we submit our form data, the request's `request.formData` will contain an additional field `formData.get("intent")`.

We can use this value to decide what to do next:

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { todo } = Object.fromEntries(formData.entries());
  const intent = formData.get("intent");
  switch (intent) {
    case "add": await addTodo(todo); break;
    case "clear": clearTodos(); break;
    default: throw new Error("Unexpected action");
  }
  return json({ ok: true });
}
```

And finally, here's how the UI works after taking into consideration the value of `intent`:

![](/assets/posts/how-to-handle-multiple-form-actions-in-remix/b62a385e-e505-487a-9435-f1864858e54f.gif)

You can experiment with the above pattern in the [Codesandbox](https://codesandbox.io/p/devbox/handle-many-actions-hhd63z?file=%2Fapp%2Froot.tsx&embed=1&layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522clpth9y6z00093b6a47evigv0%2522%252C%2522sizes%2522%253A%255B100%252C0%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522clpth9y6y00023b6a0ptapyjc%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522clpth9y6y00063b6au87dkya7%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522clpth9y6y00083b6ahs600e8c%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%252C%2522sizes%2522%253A%255B50%252C50%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522clpth9y6y00023b6a0ptapyjc%2522%253A%257B%2522id%2522%253A%2522clpth9y6y00023b6a0ptapyjc%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clpthg7ks00023b6af7lqe632%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A9%252C%2522startColumn%2522%253A1%252C%2522endLineNumber%2522%253A9%252C%2522endColumn%2522%253A1%257D%255D%252C%2522filepath%2522%253A%2522%252Fapp%252Froutes%252F_index.tsx%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%252C%257B%2522id%2522%253A%2522clpthnbob00023b6afp7ygakm%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A20%252C%2522startColumn%2522%253A5%252C%2522endLineNumber%2522%253A20%252C%2522endColumn%2522%253A5%257D%255D%252C%2522filepath%2522%253A%2522%252Fpackage.json%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%252C%257B%2522id%2522%253A%2522clptizdiv00023b6ao80s4v39%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A29%252C%2522startColumn%2522%253A12%252C%2522endLineNumber%2522%253A29%252C%2522endColumn%2522%253A12%257D%255D%252C%2522filepath%2522%253A%2522%252Fapp%252Froot.tsx%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clptizdiv00023b6ao80s4v39%2522%257D%252C%2522clpth9y6y00083b6ahs600e8c%2522%253A%257B%2522id%2522%253A%2522clpth9y6y00083b6ahs600e8c%2522%252C%2522activeTabId%2522%253A%2522clpthny38003w3b6arfianvh0%2522%252C%2522tabs%2522%253A%255B%257B%2522type%2522%253A%2522UNASSIGNED_PORT%2522%252C%2522port%2522%253A3000%252C%2522id%2522%253A%2522clpthny38003w3b6arfianvh0%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522path%2522%253A%2522%252F%253Findex%2522%257D%255D%257D%252C%2522clpth9y6y00063b6au87dkya7%2522%253A%257B%2522id%2522%253A%2522clpth9y6y00063b6au87dkya7%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clpth9y6y00033b6afelr81jd%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522build%2522%257D%252C%257B%2522id%2522%253A%2522clpth9y6y00043b6ay8dapjjv%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522dev%2522%257D%252C%257B%2522id%2522%253A%2522clpth9y6y00053b6aronu3r99%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522typecheck%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clpth9y6y00043b6ay8dapjjv%2522%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Afalse%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D) I created.

## Further reading {#heading-further-reading}

[Remix Tutorial](https://remix.run/docs/en/main/start/tutorial) - I highly recommend you do the ~30-minute long, comprehensive, official tutorial explaining basic Remix concepts such as data mutations, data loading, routing, styling helpers, etc.

[Community](https://remix.run/docs/en/main/start/community) - check out the Remix community links, including their Discord server and a vast collection of Remix-related links.

[The Ultimate Full Stack Framework for 2024: Remix](https://akoskm.com/the-ultimate-full-stack-framework-for-2024-remix) - Remix blew my mind with its simplicity and philosophy. After using it only for a few days, I wrote about why it is my big bet for 2024.
