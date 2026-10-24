---
title: "electron-builder: Mac, Windows, and Linux builds"
publishedAt: "2022-09-26T05:15:22.477Z"
updatedAt: "2026-10-24T12:00:00.000Z"
description: "electron-builder 26.18.0 and Electron 45: one config for a Mac dmg, a Windows NSIS installer, and a Linux AppImage. Notarize with notarytool, then publish."
coverImage: "../../assets/covers/electron-builder.png"
tags:
  - name: "JavaScript"
    slug: "javascript"
  - name: "Electron"
    slug: "electron"
  - name: "Tutorial"
    slug: "tutorial"
  - name: "Beginner Developers"
    slug: "beginners"
  - name: "Web Development"
    slug: "web-development"
series:
  name: "Electron"
  slug: "electron"
draft: false
---

`npm run dist` packages the app for the OS you run it on. With electron-builder 26.18.0 and Electron 45.0.0, macOS gets a dmg and a zip, Windows gets an NSIS installer, and Linux gets an AppImage.

In this post of our [Electron series](https://akoskm.com/series/electron), we'll learn how to package your Electron application with electron builder so you can distribute it.

There are two ways to distribute your app. You can simply make your source code public, let users download it, package it, and run the app for themselves.

Distributing source code has two disadvantages:

1. it's inconvenient - depending on your app, your users might not have the tools to run or package your app
2. you don't want to make your app's source code public and available to download for everyone.

Distributing your app as a package is probably the best way to get your software to users.

There are two main ways to package an electron app:

- manually
- with tooling, such as [electron-builder](https://www.electron.build/)

The manual process involves downloading the Electron executable and setting up a specific directory structure. It's more complicated and includes more steps than using electron-builder; thus, it's more error-prone. However, if you want to see how to do that, check it out [here](https://www.electronjs.org/docs/latest/tutorial/application-distribution).

I recommend using a tool such as electron-builder for two reasons:

- it's super simple to configure. All your configuration is in the `package.json` file of the app, and you can configure multiple distributions in the same place
- it automatically creates the appropriate directories; this includes setting up the correct way to handle the app assets if you have any

## Setup

We will modify the `package.json` file from our first blog post [Build a JavaScript Desktop app with Electron](https://akoskm.com/build-a-javascript-desktop-app-with-electron).

That file pinned Electron `^20.0.2`. The current release is Electron 45.0.0. `npm install -D electron-builder` resolves to 26.18.0.

First, you'll have to add the electron-builder package as a dev dependency:

```bash
npm install -D electron@45.0.0 electron-builder@26.18.0
```

Auto-update needs `electron-updater` in `dependencies`. The packaged app receives `dependencies`, so that package has to be listed there.

```bash
npm install electron-updater@6.8.11
```

After this, we will add one new script to our "scripts" section of `package.json`:

```json
"dist": "electron-builder"
```

Running `npm run dist` will generate operating-system-specific packages, such as dmg, AppImage, or whatever you tell the configuration to generate, depending on which platform you're running this command.

For example, I'm running this on macOS, so it'll generate macOS-specific files for me.

You don't have to generate a package for all OSes, but let's see how to control that with electron-builder configuration. `npx electron-builder --mac`, `--win`, or `--linux` builds that platform. `-mwl` builds all three.

## Configuration

electron-builder can be conveniently configured by adding a `build` section to the `package.json` file of the Electron app. `electron-builder.yml` is the other file it picks up, and it is the default path for `--config`.

```json
{
  "name": "electron-blog-example",
  "version": "1.0.0",
  "description": "A small Electron app packaged with electron-builder.",
  "main": "main.js",
  "author": "Ákos Kőműves",
  "desktopName": "electron-blog-example.desktop",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "com.example.electronblog",
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.developer-tools"
    },
    "dmg": {
      "title": "${productName} ${version}"
    },
    "linux": {
      "target": ["AppImage"],
      "syncDesktopName": true
    },
    "win": {
      "target": "nsis"
    }
  },
  "dependencies": {
    "electron-updater": "6.8.11"
  },
  "devDependencies": {
    "electron": "45.0.0",
    "electron-builder": "26.18.0"
  }
}
```

The 2022 log warned `description is missed in the package.json`. That warning is still in 26.18.0, so the sample sets `description`.

### appId

Although you're not required to set it, I strongly recommend doing so. Leave it out and the id becomes `com.electron.${name}`.

For example, on macOS, this key is used to associate app-specific configuration, such as notifications with the app itself or whether the app is capable of opening specific files.

Windows uses this ID to associate processes, files, and windows to this particular application. For the NSIS target it is the Application User Model ID.

Use a reverse-DNS id. The sample uses `com.example.electronblog`.

### Per-platform options

`mac`, `linux`, and `win` are the per-platform configurations. `dmg` is the disk image. `appId` for a Mac build belongs under `mac`. A `dmg` block that includes `appId` fails validation on electron-builder 26.18.0.

```json
"build": {
  "appId": "com.example.electronblog",
  "mac": {
    "appId": "com.example.electronblog.mac",
    "target": ["dmg", "zip"]
  }
}
```

Per-platform options override global options. I built that `mac.appId` with `--mac dir`, and `CFBundleIdentifier` in the app was `com.example.electronblog.mac`.

`dmg.title` defaults to `${productName} ${version}`. The line in the sample is that default, so you can drop it.

The mac targets in the sample are the defaults too: `zip` and `dmg`. The 2022 log built a zip even though the config only set a dmg title, and that is why. Keep the zip if you want auto-update. The mac options say a dmg update needs both files.

Windows defaults to `nsis`. The icon it looks for is `build/icon.ico`. On macOS the icon is `build/icon.icns`. With neither file around, the log says `default Electron icon is used`.

The Linux default in 26.18.0 is snap and AppImage. Snap wants snapcraft on the machine, so the sample names AppImage and stops there. Add `deb` when you want an apt package.

`desktopName` is in `package.json` because Electron uses it as the window class. Without it, the AppImage build warns that the desktop environment may not tie the running window to the `.desktop` file. `linux.syncDesktopName` defaults to false in 26.18.0, so the sample sets it to true. The field comment says v27 will default that flag to true.

`extraResources` copies files into the app's resources directory. That is `Contents/Resources` on macOS, and `resources` on Windows and Linux.

## Package the app

Now that our `package.json` is set up, we're ready to create a packaged version of our application. Head to the terminal and run:

```bash
npm i
npm run dist
```

On Linux, `npx electron-builder --linux AppImage` printed:

```text
• electron-builder  version=26.18.0 os=6.12.94+
• loaded configuration  file=package.json ("build" field)
• writing effective config  file=dist/builder-effective-config.yaml
• packaging       platform=linux arch=x64 electron=45.0.0 appOutDir=dist/linux-unpacked
• default Electron icon is used  reason=application icon is not set
• building        target=AppImage arch=x64 file=dist/electron-blog-example-1.0.0.AppImage
```

`dist/builder-effective-config.yaml` is the config after defaults and detection, including `electronVersion`. 26.18.0 writes it when the terminal is interactive and the build is not on CI. A `cscLink` in that file is replaced with `<hidden by builder>`. `dist/builder-debug.yml` is written when you run with `DEBUG=electron-builder`.

The build also runs `@electron/rebuild` for Electron 45.0.0. `npx electron-builder install-app-deps` is the same rebuild without packaging.

### Results (macOS)

If you're on macOS, typing `open .` will open the current folder where you'll see a new folder created `dist`.

The installer is `electron-blog-example-1.0.0.dmg`. Open it and you get the familiar macOS install screen, where you drag the app into Applications. After that, the packaged app shows up in your applications folder and in Launchpad.

Of course, it would not be delightful to reinstall the app every time you want to test its packaged version.

This is why electron-builder also creates a macOS executable version of your app inside the `mac` folder. For this sample that is `dist/mac/electron-blog-example.app`. You double-click it, and it runs as if it had already been installed.

`npx electron-builder --mac zip` on Linux wrote that `.app` and `dist/electron-blog-example-1.0.0-mac.zip`. The dmg target did not finish there. It stopped with `spawn sips ENOENT`, and `sips` ships with macOS. Build the dmg on a Mac.

Signing on that Linux run was skipped, `supported only on macOS`. On a Mac with no Developer ID Application certificate in the keychain, signing is skipped as well.

Congratulations, you created a desktop installer and an executable for your JavaScript app!

### Results (Linux)

The AppImage landed at `dist/electron-blog-example-1.0.0.AppImage`. The unpacked directory is `dist/linux-unpacked`, and the executable inside it is `electron-blog-example`. Same habit as the `mac` folder: run the unpacked app when you don't want to install.

### Results (Windows)

The NSIS target is the Windows installer. The log names the file `dist/electron-blog-example Setup 1.0.0.exe`.

`npx electron-builder --win nsis` on Linux wrote `dist/win-unpacked/electron-blog-example.exe`, then exited because `spawn wine ENOENT`. Wine was not installed, and the Setup file it left behind was not a finished installer. Build that target on Windows. The log also said `no code signing certificate configured, signing is skipped`.

## Code signing and notarization

Signing proves the app came from you. Notarization is Apple's scan of that signed app, and it has been required for apps distributed outside the Mac App Store since macOS 10.15. electron-builder 26.18.0 notarizes with notarytool, through `@electron/notarize` 2.5.0. That call submits the app and staples the ticket.

`hardenedRuntime` defaults to true on a normal macOS build. `notarize: true` makes the notarize step explicit. `notarize: false` skips it. When the Apple variables below are missing, 26.18.0 skips notarization because it could not build the options.

```json
"mac": {
  "target": ["dmg", "zip"],
  "hardenedRuntime": true,
  "notarize": true,
  "category": "public.app-category.developer-tools"
}
```

The helper in 26.18.0 sets `tool` to `notarytool` and reads one of these.

Apple ID, from an app-specific password at appleid.apple.com:

```bash
export APPLE_ID=you@example.com
export APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
export APPLE_TEAM_ID=ABCDE12345
```

An App Store Connect API key:

```bash
export APPLE_API_KEY=/path/to/AuthKey_KEYID.p8
export APPLE_API_KEY_ID=KEYID
export APPLE_API_ISSUER=your-issuer-id
```

A keychain profile already on the Mac uses `APPLE_KEYCHAIN_PROFILE`, plus `APPLE_KEYCHAIN` when the profile is not in the login keychain.

The certificate is either a Developer ID Application identity in the keychain, or a `.p12` you point at:

```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=yourpassword
```

`mac.identity` picks the certificate by name when the keychain has several. `null` skips signing. `"-"` is an ad-hoc signature, and ad-hoc signing together with the default hardened runtime needs `com.apple.security.cs.disable-library-validation` or the app can fail to launch.

Skip `build/entitlements.mac.plist` and 26.18.0 uses its template. The template enables `com.apple.security.cs.allow-jit`, `com.apple.security.cs.allow-unsigned-executable-memory`, and `com.apple.security.cs.disable-library-validation`. Your own file at `build/entitlements.mac.plist` replaces the app entitlements, so keep `allow-jit` in it. The option text says an arm64 app can crash without that entitlement, from Electron 20 onward.

The docs site nests `hardenedRuntime` under `mac.sign`. That object is the v27 shape. On 24 Oct 2026, `npm view electron-builder dist-tags` showed `latest` at 26.18.0 and `next` at 27.0.0-alpha.12. In 26.18.0, `mac.sign` is a custom signing function. `hardenedRuntime`, `entitlements`, and `identity` belong on `mac`.

Windows looks at `WIN_CSC_LINK`, then `CSC_LINK`. The password is `CSC_KEY_PASSWORD`. Since June 2023, Windows treats a non-EV certificate like an unsigned app. [Electron's code signing page](https://www.electronjs.org/docs/latest/tutorial/code-signing) is the write-up of that rule.

## Auto-update

`electron-updater` checks a server you publish to. The `publish` block tells electron-builder where that server is. Leave `owner` and `repo` out and 26.18.0 fills them from the `repository` field, or from `.git/config`. Set them when neither of those points at the repo you want.

```json
"publish": {
  "provider": "github",
  "owner": "your-name",
  "repo": "electron-blog-example"
}
```

`GH_TOKEN` or `GITHUB_TOKEN` has to be able to write to that repo. The GitHub release type defaults to `draft`.

```bash
GH_TOKEN=... npx electron-builder --publish always
```

`--publish` also takes `onTag`, `onTagOrDraft`, and `never`.

In the main process, after the window exists:

```js
const { autoUpdater } = require("electron-updater");

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

electron-builder writes `app-update.yml` into the packaged app's resources, and that file is the feed. Leave `setFeedURL` out. A run from `npm start` looks for `dev-app-update.yml` instead, so the check is for the packaged app.

On macOS the signed app is what auto-update requires, and the zip target has to stay. The updater downloads that zip.
