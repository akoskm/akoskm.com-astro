---
title: "Let's talk about bind"
publishedAt: "2016-09-16T00:00:01.000Z"
description: "The difference between JavaScript apply, call, and bind: apply takes an array of arguments, call and bind take them one by one, and bind does not invoke the function."
brief: "A few days ago I was asked if I could tell the difference between apply, call and bind.\nBoth apply and call used to call functions and there are dozens of posts explaining how they do that.\nThey're expecting this as their first argument, and if you e..."
readTimeInMinutes: 3
tags: []
series: null
draft: false
---

A few days ago I was asked if I could tell the difference between `apply`, `call` and `bind`.
Both `apply` and `call` used to call functions and there are dozens of posts explaining how they do that.
They're expecting `this` as their first argument, and if you ever read this clever comparison on [Stack Overflow](http://stackoverflow.com/questions/1986896/what-is-the-difference-between-call-and-apply#comment14359320_1986896):

> Think of a in apply for array of args and c in call for columns of args.

you'll hardly ever forget what's the only real difference.
`apply` expects the arguments after `this` in array-like form while `call` expects them individually.

Because of [No Autobinding](https://facebook.github.io/react/docs/reusable-components.html#no-autobinding) in React
I used `bind` regularly, but I still had no idea how it compared to `apply` or `call`, so here are my findings:

### Similarities {#similarities}

1. All three functions accept `this` as their first argument. `bind` is more
   `call`-like meaning that it expects the arguments to be passed individually.

### Differences {#differences}

1. `apply` and `call` used to invoke functions, `bind` *creates* a new function.
   When you invoke this function it will has its `this` keyword set to the value you provided as first argument.

```javascript
var cat = {
  name: 'Milu',
  greet: function (greeting) {
    return greeting + ', ' + this.name;
  }
};

cat.greet.apply(cat, ['Hi']); // returns Hi, Milu
cat.greet.call(cat, 'Hello'); // returns Hello, Milu
var greetBound = cat.greet.bind(cat, 'Hey');   // returns a function
greetBound() // returns Hey, Milu
```

These things can be found in the documentation so let's do something what isn't there.

### Invocation with Function objects {#invocation-with-function-objects}

Below is a function `purr`, which in fact is a `Function` object. Every `Function` object has a
`name` property so the following call will result in:

```javascript
function purr() {
  return 'purrs at a frequency of 20 to 30 vibrations per second';
}

var greetBound = cat.greet.bind(purr, ['Hey']);
greetBound(); // returns Hey, purr
```

The same thing will happen when you call `apply` or `call` while providing `purr` as first argument.

### Invocation with an array of arguments {#invocation-with-an-array-of-arguments}

Passing an array of arguments to `bind` then calling the bound function will have the same effect like
passing it to `call`:

```javascript
var cat = {
  name: 'Milu',
  greet: function (greeting) {
    return greeting + ', ' + this.name;
  }
};

cat.greet.call(cat, ['Hi', 'Hello']); // returns Hi,Hello, Milu
var greetBound = cat.greet.bind(cat, ['Hi', 'Hello']);
greetBound(); // returns Hi,Hello, Milu
```

`bind` converts its second argument to string before passing it to the bound function.

### When to use bind {#when-to-use-bind}

Bind is really just a `call` except that the invocation of the bound function can be delayed.
This reminds us to callbacks functions. Sadly, most of the examples I encountered did use `bind`
with callback functions but they didn't had the most thoughtful design,
which justified the usage of `bind`:

```javascript
var Widget = function () {
  this.counter = 0;
  $('button').on('click', function () {
    this.counter += 1;
    $('span').text(this.counter);
  }.bind(this));
};
```

A simpler widget:

```javascript
var Widget = function () {
  var counter = 0;
  $('button').on('click', function () {
    counter += 1;
    $('span').text(counter);
  });
};
```

Browsing through dozens of examples I saw that `bind` is more extensively used where the code
has conventional object-oriented design - which I've been avoiding altogether when it comes to JavaScript, and it pretty
much explains why I had no idea how it compares to `call` and `apply`.

Do you have a specific scenario where `bind` is inevitable, or more appropriate? Let me know in the comments!
