---
title: "Browserify for development and production"
publishedAt: "2016-09-20T00:00:01.000Z"
updatedAt: "2021-06-24T14:37:33.729Z"
description: "How Realtime Raytracer uses Browserify npm scripts for a debuggable development build and a compressed bundle served in production."
brief: "Realtime Raytracer, the acoustical design tool, is now in alpha! Check out the demo\nhere and the promo video\nhere.\nOne of the final steps before the alpha release was to improve the existing npm scripts to\nproduce files that are easier to debug and t..."
readTimeInMinutes: 2
tags: []
series: null
draft: false
---

Realtime Raytracer, the acoustical design tool, is now in alpha! Check out the demo
[here](http://bp3dbt2d-env.us-east-1.elasticbeanstalk.com) and the promo video
[here](https://www.youtube.com/watch?v=cBA91hA2NEw).

One of the final steps before the alpha release was to improve the existing npm scripts to
produce files that are easier to debug and to create a compressed bundle which will be served to the client.

### blueprint3d scripts {#blueprint3d-scripts}

The Realtime Raytracer is based on [blueprint3d](https://github.com/furnishup/blueprint3d).
In the beginning <code>package.json</code> contained only a single npm script which built the application without
any further minification or obfuscation:

```json
"scripts": {
  "build": "browserify src/blueprint3d.js > example/js/blueprint3d.js --verbose"
}
```

Because the previous command dumped everything into a single file, it was a bit uncomfortable for
debugging, especially when the application began to grow.

Speaking about size, trimming out the unnecessary characters from the source before delivering it to the client
was also a requirement. So the two main goals were:

* to have the ability of debugging separate files
* deliver a compressed, if possible 'uglified', final file to the client

### Debugging separate files {#debugging-separate-files}

This was fairly easy, thanks to the built-in flag of [browserify](https://github.com/substack/node-browserify#usage).
A quick googling might suggest that you could do it through [minifyify](https://github.com/ben-ng/minifyify).
But the source maps won't behave as you would expect and what could be easier than:

```
 --debug -d  Enable source maps that allow you to debug your files

             separately.
```

Adding this to the existing npm script:

```json
"scripts": {
  "build": "browserify -d src/blueprint3d.js > example/js/blueprint3d.js --verbose"
}
```

made the original source files debuggable, separately, without any additional plugin.

### Production build {#production-build}

The final script is produced by minifyify (which internally uses
[uglify-js](https://github.com/mishoo/UglifyJS2)), because it creates smaller bundles then uglify-js itself.
The final bundle was 811 KB with uglify-js while with minifyify only 596 KB.

The command for doing a minifyify-ed build looks like:

```
browserify src/blueprint3d.js -p [minifyify --no-map] > example/js/blueprint3d.js
```

and here is the final set of scripts that is currently in use for production and development:

```json
"scripts": {
  "dev": "browserify -d src/blueprint3d.js > example/js/blueprint3d.js --verbose"
  "prod": "browserify src/blueprint3d.js -p [minifyify --no-map] > example/js/blueprint3d.js"
}
```

If you want mangling, that's possible too. Specify any mangling options after <code>--mangle</code>:

```
browserify src/blueprint3d.js -p [minifyify --no-map --uglify [ --mangle [ 'toplevel' ] ] ] > example/js/blueprint3d.js
```

from [uglify-js](https://github.com/mishoo/UglifyJS2#mangler-options).

If you would like to experiment further, there is a minimalistic application which uses these
scripts to generate development and production bundles: [browserify-example](https://github.com/akoskm/browserify-example).

Is there a better way to do this? Do you use something else? Feel free to leave a comment below!
