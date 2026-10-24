---
title: "MongoDB Schemas"
publishedAt: "2016-05-04T12:00:00.000Z"
updatedAt: "2021-06-24T14:38:27.098Z"
description: "Schema lessons from building 10log.com on MongoDB. Documents are schemaless in the relational sense, but the shape of the data still matters."
brief: "Back in 2015, when we started laying down the foundations of 10log.com we were pretty new to the whole MongoDB ecosystem. The idea of a schemaless database sounded promising due to the nature of the information we store. We also learned quite a few t..."
subtitle: "Lessons Learned at 10log"
readTimeInMinutes: 3
tags: []
series: null
draft: false
---

Back in 2015, when we started laying down the foundations of [10log.com](https://10log.com) we were pretty new to the whole MongoDB ecosystem. The idea of a schemaless database sounded promising due to the nature of the information we store. We also learned quite a few things!

### Schema design {#schema-design}
We were told that MongoDB is schemaless. It is, in the RDBM sense. Documents in the same collection can have varying sets of fields, with different types for each field.

The word schemaless should be interpreted on document level.

> One of the great benefits of these dynamic objects is that schema migrations become very easy.  With a traditional RDBMS, releases of code might contain data migration scripts.  Further, each release should have a reverse migration script in case a rollback is necessary.  ALTER TABLE operations can be very slow and result in scheduled downtime.
>
> Source: [http://blog.mongodb.org/post/119945109/why-schemaless]

You can only enjoy the benefits of such seamless migrations if you get your database right from the beginning. If you don't, you have to deal with migration scripts.

It's *crucial* to properly identify your [collections] and [documents].

#### Embedded documents {#embedded-documents}

You will frequently encounter examples advocating the usage of [embedded documents].

<pre>
// User document
{
  name: 'Mike',
  role: 'developer',
  projects: [{
    id: 1
    name: 'self driving car',
  }, {
    id: 2,
    name: 'smart watch'
  }]
}
</pre>

While embedded documents can:

1. reduce the number of read operations
2. eliminate joins
3. support atomic operations

they can't:

1. grow over the [maximum BSON document size], which is 16 megabyes
2. be easily restructured without migration scripts

Going back to our example, as the requirements change over time, the project might also need a list of developers, or just another project manager. While these changes could be implemented with the existing schema, the solutions would be complicated and it would require a few operations to find out things like all developers for specific project.

<pre>
// User collection
[{
  &#95;id: ObjectId("5126bbf64aed4daf9e2ab771"),
  name: 'Mike',
  role: 'developer',
}, {
  &#95;id: ObjectId("5126bbf64aed4daf9e2ab772"),
  name: 'Tom',
  role: 'manager',
}]

// Project collection
[{
  &#95;id: ObjectId("5126bbf64aed4daf9e2ab773"),
  name: 'self driving car',
  manager: ObjectId("5126bbf64aed4daf9e2ab772"),
  developers: [
    ObjectId("5126bbf64aed4daf9e2ab771")
  ]
}]
</pre>

We found that keeping such documents in separate collections results in a data structure that better tolerates future changes than the embedded solution.

#### Documents {#documents}
Why don't we put everything into its own collection then? Creating a 1:1 copy of your relational schema won't work either. The resulting schema will simply miss the great features of MongoDB and it may feel difficult to work with.

Try to identify your embedded documents by analyzing One-to-One and One-to-Many relationship inside your schema. We could extend the User document with addresses and settings because such data belongs only to that user.

<pre>
// User collection
[{
  &#95;id: ObjectId("5126bbf64aed4daf9e2ab771"),
  name: 'Mike',
  role: 'tinkerer',
  address: [{
    street: 'Denny Way 53',
    city: 'Seattle',
    zip: '98118'
  }, {
    street: 'Broad St 76',
    city: 'Seattle',
    zip: '98118'
  }],
  settings: [{
    sidebar: 'open'
  }, {
    history: 'on'
  }]
}]
</pre>

#### Final thoughts {#final-thoughts}
Schema design is very important and shouldn't be overlooked, even if MongoDB's collections don't enforce any document structure. You should not try to fit your relational schema into MongoDB, it probably won't work. It will feel unnatural, hard to work with and you'll wish you never tried MongoDB.

Take the time to understand which problems MongoDB solves before running into a situation that you created by not using it correctly.
[Introduction to MongoDB] is a good place to start.

[http://blog.mongodb.org/post/119945109/why-schemaless]: http://blog.mongodb.org/post/119945109/why-schemaless
[hampden]: https://github.com/jekyll/jekyll
[maximum BSON document size]: https://docs.mongodb.org/manual/reference/limits/#BSON-Document-Size
[embedded documents]: https://docs.mongodb.org/manual/core/data-model-design/#embedded-data-models
[collections]: https://docs.mongodb.org/manual/core/databases-and-collections/#collections
[documents]: https://docs.mongodb.org/manual/core/document/
[Introduction to MongoDB]: https://docs.mongodb.org/manual/introduction/
