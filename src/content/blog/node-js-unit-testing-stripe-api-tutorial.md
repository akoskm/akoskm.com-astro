---
title: "Unit Testing Node.js apps and Stripe API integration"
publishedAt: "2016-07-01T00:00:01.000Z"
updatedAt: "2021-06-24T15:05:39.530Z"
description: "Unit test a Node.js Stripe integration so a successful charge triggers the side effects your app expects. This tutorial was featured in Node Weekly."
brief: "This tutorial appeared in node weekly.\nStripe maintains a handful of official API libraries,\nthey are simple and equipped with language-specific examples so you can easily integrate them\ninto your own software product.\nDepending on your application a..."
readTimeInMinutes: 3
tags:
  - name: "unit testing"
    slug: "unit-testing"
  - name: "stripe"
    slug: "stripe"
series: null
draft: false
---

_This tutorial appeared in <a href='http://nodeweekly.com/issues/145'>node weekly</a>._

Stripe maintains a handful of [official API libraries](https://stripe.com/docs/libraries/),
they are simple and equipped with language-specific examples so you can easily integrate them
into your own software product.

Depending on your application a successful payment has different implications, but it's always a
good idea to make sure that the user gets what he's paid for.

In the Node-Stripe API world this means that the callback which is executed after a payment
has been made behaves correctly in various scenarios. To make sure that it does, let's
cover it with some unit tests.

_This tutorial is about testing your Stripe driven code, if you're still unfamiliar with stripe
I suggest you to read the [Node.js Stripe API Reference](https://stripe.com/docs/api/node#intro)._

Let's say we built an application where the users can order hand-made cosmetics through your web-shop.
Here is the module which handles all the Stripe related stuff:

```javascript
var stripe = require('stripe')(
  'sk_test_your_stripe_test_key'
);

module.exports = {

  createOrder: function (req, cb) {
    var items = req.items,
        email = req.email,
        errors = [];

    // Always validate the user input before handling it to an external API.
    // If you can detect requests that would fail anyway, you'll spare the
    // cost of the network request before it's even made.
    if (!items || items.length < 1) {
      // return cb('No items found.', null);
      errors.push('No items found.');
    }

    // a terrible way to validate an email address
    if (!email) {
      errors.push('Email is required.');
    }

    if (errors.length > 0) {
      cb(errors, null);
    } else {
      stripe.orders.create({
        currency: 'usd',
        items: items,
        email: email
      }, function(err, order) {
        // stripe response, asynchronously called
        if (err) {
          cb(err, null);
        } else {
          if (!order || !order.id) {
            cb('Unknown error occurred.', null);
          } else {
            cb(null, order);
          }
        }
      });
    }
  }
});
```

<code>stripe.orders.create</code> returns an [order](https://stripe.com/docs/api#order_return_object)
object if the call succeeded and err otherwise.

Don't forget that we don't want to test the correctness of the Stripe API itself only the behavior of
its callback method. We are going to use [Sinon.JS](http://sinonjs.org) to stub the real Stripe API methods
and return fake responses to our module.

One thing that won't be obvious when you start stubbing Stripe methods is that _create_ isn't
a property of the <code>orders</code> object. That's because
[Orders](https://github.com/stripe/stripe-node/blob/master/lib/resources/Orders.js)
extends
[StripeResource](https://github.com/stripe/stripe-node/blob/master/lib/StripeResource.js) so the order
methods are really in <code>orders.__proto__</code>:

```javascript
this.sandbox.stub(stripeClient.orders.__proto__, 'create', func);
```

The above stub will prevent the real <code>orders.create</code> from being called
and gives you control over triggering its callback with arbitrary parameters.

Let's start by implementing the best-case scenario, when the Stripe API executes our callback with a newly
created order that contains only an id and with no errors:

```javascript
this.sandbox.stub(stripeClient.orders.__proto__, 'create', function (orderRequest, func) {
  func(null, {id: 123});
});
```

Go back to our module we can see what happens in this case:

```javascript
if (!order || !order.id) {
  cb('Unknown error occurred.', null);
} else {
  cb(null, order);
}
```

Since our order was <code>{id: 123}</code> the <code>cb</code> callback passed to <code>createOrder</code>
should be called with <code>null, order</code>.

To prove this just call <code>module.createOrder</code> in your favorite test suite and see if the callback
has the expected parameters:

```javascript
stripeConnector.createOrder(request, function (err, order) {
  assert.isNull(err);
  assert.isNotNull(order.id);
  assert.equal(123, order.id);
});
```

For complete code and running tests the git repository:
[node-stripe-api-testing-tutorial](https://github.com/akoskm/node-stripe-api-testing-tutorial).

Leave a comment below and let me know what you think!
