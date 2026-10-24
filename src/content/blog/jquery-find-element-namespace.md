---
title: "$.find and XML namespaces"
publishedAt: "2013-09-14T13:04:32.000Z"
updatedAt: "2021-06-24T14:36:50.786Z"
description: "Query namespaced XML with jQuery. find() on fancynamespace:tag works in Firefox or Chrome, not both, and a nodeName filter fixes it."
brief: "Querying XML documents\nIt's fine until you face though times and you have to find this:\n&lt;fancynamespace:tag color=\"green\" size=\"huge\"&gt;Kiwi&lt;/fancynamespace:tag&gt;\n\nor a normal-sized Kiwi, that's even harder!\nYou think you have a solution\nThe..."
readTimeInMinutes: 2
tags:
  - name: "JavaScript"
    slug: "javascript"
  - name: "xml"
    slug: "xml"
  - name: "jQuery"
    slug: "jquery"
series: null
draft: false
---

Querying XML documents {#querying-xml-documents}
----------------------
It's fine until you face though times and you have to find this:

```xml
&lt;fancynamespace:tag color="green" size="huge"&gt;Kiwi&lt;/fancynamespace:tag&gt;
```

or a normal-sized Kiwi, that's even harder!

You think you have a solution {#you-think-you-have-a-solution}
------------------------------

Then you try `$xmlDoc.find('fancynamespace\\:tag')` which [works fine in Firefox but not in Chrome](http://stackoverflow.com/questions/128580/jquery-find-problem). If you decide to ignore the namespace and query only for tag: `$xmlDoc.find('tag')`, that will work in Chrome but not in Firefox.

nodeFilter {#nodefilter}
----------
[nodeFilter](https://github.com/akoskm/nodeFilter) is a tiny little jQuery plugin which helps you to write selectors for XML elements, even for those with namespaces. It was ispired by these few lines of code:

```js
$.fn.filterNode = function(name) {
    return this.find('*').filter(function() {
       return this.nodeName === name;
    });
};
```

[Source](http://stackoverflow.com/questions/853740/jquery-xml-parsing-with-namespaces)

which quickly showed its disadvantage. Because it only considers the nodeName `(fancynamespace:tag)` it will fail even with a slightly complex query: `('fancynamespace:tag[color="red"][size="huge]')`

nodeFilter solves this problem by splitting up the entire query string with this tiny regexp `/(?=\[)/g`, comparing the nodeName with the very first result of split array, then applying the rest of the results to the target element with `$.is`.

I also created a little comparison table to show, how `$.find` works in a different browser (when it comes to namespaces), and what you actually get with nodeFilter:

**Firefox**
```
|               | `prefix:tag` | `prefix\\:tag`   | `tag` | `prefix:tag[color="green"]`     |
| ------------- |:------------:|:----------------:|:-----:|:-------------------------------:|
| $.find        |0             |6                 |0      |0                                |
| $.nodeFilter  |6             |0                 |0      |1                                |
```

**Chrome**

```
|               | `prefix:tag` | `prefix\\:tag`   | `tag` | `prefix:tag[color="green"]`     |
| ------------- |:------------:|:----------------:|:-----:|:-------------------------------:|
| $.find        |0             |0                 |6      |0                                |
| $.nodeFilter  |6             |0                 |0      |1                                |
```

Source {#source}
------

[https://github.com/akoskm/nodeFilter](https://github.com/akoskm/nodeFilter)
