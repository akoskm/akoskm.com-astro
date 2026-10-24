---
title: "Keeping React Components Manageable: Dodge Overcomplication and Ensure Business Logic Stays in Place"
publishedAt: "2023-10-18T05:19:35.089Z"
description: "Optimize React components by separating logic, simplifying, and ensuring adaptability for evolving SaaS UI and business needs"
brief: "When appropriately executed, software development produces adaptable solutions that can evolve with the constantly shifting technological landscape, programming methodologies, and business requirements. Thoughtfully designed system components remain ..."
readTimeInMinutes: 4
coverImage: "../../assets/posts/keeping-react-components-manageable-dodge-overcomplication-and-ensure-business-logic-stays-in-place/cover.png"
tags:
  - name: "React"
    slug: "reactjs"
  - name: "Web Development"
    slug: "web-development"
  - name: "TypeScript"
    slug: "typescript"
  - name: "software development"
    slug: "software-development"
  - name: "Software Engineering"
    slug: "software-engineering"
series: null
draft: false
---

When appropriately executed, software development produces adaptable solutions that can evolve with the constantly shifting technological landscape, programming methodologies, and business requirements. Thoughtfully designed system components remain a pleasure to work with rather than hastily altered ones. Ultimately, the choice is in our hands.

We've been building a SaaS for one of my clients for two years. With new paid features being added, we constantly change the UI: show new pricing cards or run promos for users who aren't subscribed yet.

Such a change occurred recently, and the initial solution wasn't a mindful change, but it was the perfect way to demonstrate how you can increase the complexity of your components in a matter of seconds. But, of course, I'm not going to leave you at that. I'll also show you how to work around such changes.

# A simple account panel {#heading-a-simple-account-panel}

The code in question is the account panel, which shows different messages based on whether the user has already purchased a membership:

```typescript
// AwesomeProductCard.tsx
import React from 'react';

interface AwesomeProductCardProps {
  isMember: boolean;
}

const AwesomeProductCard: React.FC<AwesomeProductCardProps> = ({ isMember }) => {
  return (
    <div>
      {isMember ? (
        <p>You are already a member!</p>
      ) : (
        <a href="https://payment-link.example.com">Click here to become a member</a>
      )}
    </div>
  );
};

export default AwesomeProductCard;
```

If the user is already a member, we return the `You are already a member!` message; otherwise, we generate a payment link where they can buy a membership.

The `AwesomeProductCard` gets called from the `Account` page:

```typescript
// AccountPage.tsx
import React from 'react';
import AwesomeProductCard from './AwesomeProductCard';

interface AccountPageProps {
  account: {
    isMember: boolean;
    role: string;
  }
}

const AccountPage: React.FC<AccountPageProps> = ({ account }) => {
  return (
    <div className="account-page">
      <h1>Account Page</h1>
      {/* Other account page components */}
      <AwesomeProductCard isMember={account.isMember} />
      {/* More account page components */}
    </div>
  );
};

export default AccountPage;
```

# Business criteria change {#heading-business-criteria-change}

After a recent backend change, users with a "member" role already had membership access. So we created a PR that wanted to fix that:

```typescript
// AwesomeProductCard.tsx
import React from 'react';

interface AwesomeProductCardProps {
  isMember: boolean;
  role: string;
}

const AwesomeProductCard: React.FC<AwesomeProductCardProps> = ({ isMember, role }) => {
  return (
    <div>
      {isMember || role === "member" ? (
        <p>You are already a member!</p>
      ) : (
        <a href="https://payment-link.example.com">Click here to become a member</a>
      )}
    </div>
  );
};

export default AwesomeProductCard;
```

While the above code works fine, the `AwesomeProductCard` that showed the correct messages based on `isMember`, now also needs to know if the value of `role` is `"member"`.

It seems as though we've inadvertently incorporated business logic into a basic component!

We are also doing a little bit of prop drilling in the parent component:

```typescript
<AwesomeProductCard isMember={account.isMember} role={account.role} />
```

So, instead of passing down the different properties of the `account` object, how about redefining how we computer `isMember`?

# Solution {#heading-solution}

This would unload the responsibility of storing business logic in `AwesomeProductCard` and the component wouldn't require any change!

But where should the new business logic go?

You guessed correctly! The `AccountPage`! We'll still be sending the `isMember` prop to `AwesomeProductCard` but instead of taking the value from `account.isMember`, we also consider the state of `account.role`:

```typescript
// AccountPage.tsx
import React from 'react';
import AwesomeProductCard from './AwesomeProductCard';

interface AccountPageProps {
  account: {
    isMember: boolean;
    role: string;
  }
}

const AccountPage: React.FC<AccountPageProps> = ({ account }) => {
  return (
    <div className="account-page">
      <h1>Account Page</h1>
      {/* Other account page components */}
      <AwesomeProductCard
        isMember={account.isMember || account.role === "member"}
      />
      {/* More account page components */}
    </div>
  );
};

export default AccountPage;
```

This time, we incorporated the business logic change by modifying only one component instead of two. `AwesomeProductCard` remained the same - the simple representational component without excessive logic.

This was yet another "production story". If you like this style and would love to read about stuff we run into in production, check out:

<div class="embed-wrapper"><div class="embed-loading"><div class="loadingRow"></div><div class="loadingRow"></div></div><a class="embed-card" href="https://akoskm.com/the-benefits-of-writing-straightforward-code">https://akoskm.com/the-benefits-of-writing-straightforward-code</a></div>

# Conclusion {#heading-conclusion}

In this article, we discussed the importance of keeping business logic separate from basic components in software development, using the example of an account panel in a SaaS application. We demonstrated how a change in business criteria could inadvertently introduce complexity into multiple components and how to work around such changes by incorporating the new business logic in the parent component, keeping child components simple, free of excessive logic, and unchanged!

Thanks a ton for reading my blogs! 🙇‍♂️

See you in the next one!
