---
title: "Browser Plugin for Estate Planning Platform"
client: "One Digital Trust"
clientUrl: "https://onedigitaltrust.com/"
description: "Built a Chrome extension that securely stores login credentials across platforms. The plugin detects login forms on any website, captures credentials after authentication, and syncs them to the client's estate planning platform. Implemented iframe-based UI for brand consistency and secure activation flow through the main platform."
technologies:
  - Chrome Extensions
  - JavaScript
  - DOM APIs
results:
  - Shipped to Chrome Web Store in 1 week
  - Handles edge cases like animated/delayed login forms
  - White-label ready for institutional partners
---

## The Problem

One Digital Trust (ODT), a pioneer in estate and inheritance planning, needed a browser plugin to streamline user login experiences. They had previously worked with another agency but their needs remained unmet. They required a versatile browser plugin that could store users' login IDs for their platform, with flexibility to adapt to the visual branding of institutional partners.

### Security Considerations

Security was critical—the plugin shouldn't provide a login portal but rather route users to log in through ODT's main platform.

### Identifying Login Forms: A Technical Challenge

Working on this plugin revealed fascinating insights into the varied nature of login forms. Standard forms with user ID and password fields were straightforward, but I faced challenges with forms that revealed submit buttons only after user actions, or used animations that complicated form detection after page load.

## My Solution

I created and launched the initial plugin version on the Chrome Web Store within a week. For controlled testing, I limited access to a select group of users via tester accounts in Chrome Web Store's Developer Dashboard.

### Ensuring Security

To secure the plugin, I leveraged ODT's existing backend architecture, allowing activation through their website. Users install the plugin, activate it by logging in via ODT's website, and after successful authentication, can enable the plugin from the web app. After activation, each time a user logs into platforms like LinkedIn, Gmail, or Facebook, the plugin offers to securely save the Login ID to ODT.

### Navigating Login Form Variations

Through smart utilization of DOM lookups, I identified login forms on web pages. On detecting a login form, I attached a listener to the form submit event, captured the Login ID, and allowed the original event to proceed—ensuring a seamless user experience.

### Crafting a Consistent Brand Experience

To maintain brand consistency and avoid conflict with page-specific styles, I designed the plugin to appear in an iframe inside the DOM on each page. This way, no matter where users logged in, they would always recognize the familiar ODT interface.
