---
title: "Use React Context to DRY up your components"
publishedAt: "2019-09-03T00:00:01.000Z"
updatedAt: "2021-06-24T14:36:06.856Z"
description: "In this post, I'll show you a typical example of plumbing inside a React application and a way to fix it."
brief: "Plumbing in programming is something you have to do to make things work. It's sometimes repetitive or looks like a boilerplate you would usually remove. It's also crucial because it connects different layers of the application. In this post, I'll sho..."
subtitle: "How to reduce plumbing in React apps?"
readTimeInMinutes: 3
coverImage: "../../assets/posts/react-usecontext-practical-example/cover.jpeg"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "JavaScript"
    slug: "javascript"
series: null
draft: false
---

Plumbing in programming is something you have to do to make things work. It's sometimes repetitive or looks like a boilerplate you would usually remove. It's also crucial because it connects different layers of the application. In this post, I'll show you a typical example of plumbing inside a React application and a way to fix it.

Let's take a look at a pretty standard, table-sidebar layout:


```jsx
<Table
  selectedProduct={product}
  products={products}
  onProductChange={handleProductChange}
/>
<Sidebar product={product} />
```


You can find the complete project [here](https://codesandbox.io/embed/table-sidebar-layout-with-plumbing-xk591?fontsize=14), without using hooks (this is not the recommended approach).

The table contains a list of products. When one of them, is clicked, the sidebar shows the details of the product and highlights the row clicked. Both `Table` and `Sidebar` need to know about the selected `product`.

`Table` needs to highlight the row:

```jsx
const Table = ({ selectedProduct, products, onProductChange }) => (
  <tbody>
    {products.map(currProduct => (
      <TableRow
        selected={isSelected(currProduct, selectedProduct)}
        key={currProduct.id}
        product={currProduct}
        onProductChange={onProductChange}
      />
    ))}
  </tbody>
);
export default Table;
```

and `Sidebar` displays additional information about the selected product:

```jsx
const Sidebar = ({ product }) => (
  <div className="sidebar">
    <h3>{product.name}</h3>
    <p>ID: {product.id}</p>
    <p>SKU: {product.sku}</p>
  </div>
);
export default Sidebar;
```

Later we decide to extend the sidebar with some sections:

```
const Sidebar = () => (
  <div className="sidebar">
    <DetailsPanel />
    <DimensionsPanel />
  </div>
);
```

As the application grows, we create wrapper components like `Sidebar`. These components don't immediately use `product`, only pass it down to child components.


## React.useContext {#reactusecontext}

[`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) is one of the three basic React hooks.

The great thing about Contexts is that the component subscribed to it automatically re-renders when the Context value changes. Our Table/Sidebar layout sounds like an ideal use case for this.

Creating a context is as simple as:

```js
const TableContext = React.createContext();
export default TableContext;
```

and to subscribe to it:

```js
const value = React.useContext(TableContext);
```

Use `<TableContext.Provider>` to set the `value` of the context. We wrap both `Table` and `Sidebar` components with this component because we want both of them to update when the context value changes:

```jsx
<TableContext.Provider value={product}>
  <Table
    products={products}
    onProductChange={handleProductChange}
  />
  <Sidebar />
</TableContext.Provider>
```

Now instead of passing the selected product to the Sidebar component, we set it as the current value of `<TableContext.Provider>`. Finally, we subscribe `Sidebar` to context updates:

```jsx
const Sidebar = () => {
  const product = React.useContext(TableContext);

  return (
    <>
      <h3>{product.name}</h3>
      <p>ID: {product.id}</p>
      <p>SKU: {product.sku}</p>
    </>
  );
}
export default Sidebar;
```

The use of context allowed us to remove the product prop from the `Sidebar` component.
We see the real benefit of `useContext` as our application grows. Earlier we presented how the `Sidebar` would look like after some development and how different Sidebar panels would need a reference to the current product. With the use of React.useContext passing down this selection through multiple layers of components is not required anymore. We subscribe to product updates with each panel as we did above with the `Sidebar` and this simplifies the component:

```jsx
const Sidebar = () => (
  <div className="sidebar">
    <DetailsPanel />
    <DimensionsPanel />
  </div>
);
```

See this code in action [here](https://codesandbox.io/embed/table-sidebar-layout-with-usecontext-os7wr?fontsize=14).

Another benefit of not passing down the same object to multiple components is avoiding repeated PropTypes declarations. Googling for "react PropTypes repeated" this looks like a problem React developers requently encounter. With the above approach, there is one place left to define the shape of the product:

```jsx
const TableContext = React.createContext();
TableContext.Provider.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    sku: PropTypes.string,
  }),
}
export default TableContext;
```

Did you find React Context useful in some other scenarios? Let me hear your story in the comment section below!

If you enjoyed this content, please show the love by sharing it with others. Thank you!

Cover photo made by <a href="https://unsplash.com/@samthewam24?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Samuel  Sianipar</a> on <a href="https://unsplash.com/s/photos/plumbing?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>.
