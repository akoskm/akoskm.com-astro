---
title: "Writer Buddy"
publishedAt: "2023-01-18T06:03:16.073Z"
description: "On publishing cadence and Writer Buddy. The routine that works is the one you keep: Ákos writes daily between 6 and 8 PM."
brief: "How often should I publish? - I'm getting the question now and then.\nThe only writing routine that works is the one you can stick to.\nIt's different for everyone. I pivoted from early morning writings to writing at night, between 6 and 8 PM. I write ..."
subtitle: "Building a desktop app that helps you establish a writing routine"
readTimeInMinutes: 3
coverImage: "../../assets/posts/writer-buddy/cover.png"
tags:
  - name: "Electron"
    slug: "electron"
  - name: "JavaScript"
    slug: "javascript"
  - name: "writing"
    slug: "writing"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "app development"
    slug: "app-development"
series: null
draft: false
---

How often should I publish? - I'm getting the question now and then.

The only writing routine that works is the one you can stick to.

It's different for everyone. I pivoted from early morning writings to writing at night, between 6 and 8 PM. I write for an hour and a half intensely, but I have already established a habit of writing each day.

When I was in the progress of creating this habit, I knew that setting short-term, realistic goals might help.

# Motivation {#heading-motivation}

I thought I could build an app to set daily word-count goals, and it'll track how many words I've written that day!

I was also writing in different places, sometimes in the Hashnode editor, sometimes in Notes or VSCode, whatever felt more suitable at that time.

So I wanted to make a desktop app independent of specific editors or websites.

This is how Writer Buddy was born! (already looking for a better name 😄)

The app consists of a panel where you can set the number of words you want to type and a progress bar.

The progress bar displays how many words you typed and acts as an area where you can start the app's word-tracking feature and close the app.

Here's how it works:

![](/assets/posts/writer-buddy/8daa24c5-287e-44b2-99b7-a8a49b3f0c96.gif)

Here are some of the challenges I faced while building this app.

# Capturing global keyboard events {#heading-capturing-global-keyboard-events}

One of the challenging parts was finding a reliable, global keyboard listener that works with Node.js and doesn't need extra dependencies (such as `jnativehook`, which requires Java).

I chose [`iohook`](https://github.com/wilix-team/iohook) despite not being updated recently, but it worked perfectly.

*On Mac, it needs BigSur or older, but it only works with Intel processors for now.*

`iohook` has an event listener, such as an HTML element would have where you can listen to the usual event you would listen to on a web page, `keydown`, `keyup`, `mousedown`, `mouseup`, etc.:

```javascript
  ioHook.on('keydown', (event) => {
    // event.keycode
  });
```

`iohook` does not track these events by default, so make sure you call `ioHook.start();` otherwise, your event listeners won't fire.

# Generating a dynamic System Tray Image {#heading-generating-a-dynamic-system-tray-image}

The dynamic progress bar in the system tray is nothing more than a PNG generated each time the user types a word.

![](/assets/posts/writer-buddy/2fd014c8-96df-4201-a454-ff38b2a32cfa.gif)

I'm using [`pureimage`](https://www.npmjs.com/package/pureimage), which provides the HTML Canvas 2D API for Node.js.

This code creates a png image 100 by 20 with a white background with the text `wordCount/goal` with Roboto font type and saves it to the path returned by `getProgressBarPath()`.

```javascript
async function createProgressBarImage() {
  const progressInPercent = (wordCount / goal) * 100;
  var img = PImage.make(100, 20);
  var ctx = img.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 100, 20);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, 0, wordCount < goal ? progressInPercent : 100, 20);
  ctx.fillStyle = '#0000ff';
  ctx.font = "20pt Roboto";
  ctx.fillText(`${wordCount}/${goal}`, 5, 17);
  await PImage.encodePNGToStream(img, fs.createWriteStream(getProgressBarPath()));
}
```

And I'm calling this function every time a word is typed.

The word-capturing mechanism checks if the current key is a Space Bar or an Enter and if the previous character wasn't a Space Bar or an Enter. This could be improved a lot because it produces some false positives:

```javascript
  ioHook.on('keydown', (event) => {
    if (!isTracking) return; // must click Start tracking in the tray

    if (event.keycode === SPACE || event.keycode === ENTER) {
      if (previousEvent.keycode !== SPACE && previousEvent.keycode !== ENTER) {
        wordCount += 1;
        reloadTrayTitle(tray)
        updateProgressBar(tray);
      }
    }

    previousEvent = event;
  });
```

# GitHub {#heading-github}

You'll find the complete repository here: [https://github.com/akoskm/writer-buddy](https://github.com/akoskm/writer-buddy).

Pull requests are welcome!

Here are a couple of ideas that I'd like to add to the project:

* A directory of skins for the progress bar. Right now, it's a simply green-on-white layout, but we could go a lot more creative with this.
    
* Automatically starting/stopping the session after some time of inactivity.
    
* a nicer settings window
    
* setting daily goals
    
* goal tracker
    

How could I improve this app so you would use it in your writing journey?
