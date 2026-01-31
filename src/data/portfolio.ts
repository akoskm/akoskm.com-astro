export interface PortfolioItem {
  slug: string;
  title: string;
  client: string;
  description: string;
  technologies: string[];
  results: string[];
  content: string;
}

const portfolio: Record<string, PortfolioItem> = {
  "browser-plugin-odt": {
    slug: "browser-plugin-odt",
    title: "Browser Plugin for Estate Planning Platform",
    client: "One Digital Trust",
    description:
      "Built a Chrome extension that securely stores login credentials across platforms. The plugin detects login forms on any website, captures credentials after authentication, and syncs them to the client's estate planning platform. Implemented iframe-based UI for brand consistency and secure activation flow through the main platform.",
    technologies: ["Chrome Extensions", "JavaScript", "DOM APIs"],
    results: [
      "Shipped to Chrome Web Store in 1 week",
      "Handles edge cases like animated/delayed login forms",
      "White-label ready for institutional partners",
    ],
    content: `
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
    `,
  },
  "supersonic-desktop": {
    slug: "supersonic-desktop",
    title: "Cross-Platform Desktop App for Acoustical Engineering",
    client: "10log LLC",
    description:
      "Transformed a proof-of-concept into a production Electron app for acoustical engineers. Built OAuth integration with the client's SaaS platform, implemented auto-updates via GitHub Actions, and managed staged rollout from alpha to stable release with Stripe-gated features.",
    technologies: ["Electron", "TypeScript", "OAuth", "FusionAuth", "Stripe", "GitHub Actions"],
    results: [
      "Shipped on Mac and Windows",
      "Seamless data sync with web platform",
      "Auto-update system for continuous delivery",
    ],
    content: `
## The Challenge

10log LLC tasked me with transforming a basic proof-of-concept single-page app into a full-fledged desktop application called Supersonic.

### Synchronizing Data with Project Varese

Supersonic needed to integrate seamlessly with 10log's existing technical and project management platform, Project Varese. This integration would allow Supersonic users to leverage their data previously created within Varese.

### Auto-update Feature

To ensure Supersonic remained current, 10log requested an auto-update feature in the desktop application.

## My Solution

The journey to bring Supersonic to life involved careful orchestration of multiple phases, resulting in a versatile desktop application compatible with both Mac and Windows.

### The Alpha Stage

Initially, I released the alpha version with a basic feature set to select users. Alpha builds were distributed through Digital Ocean Spaces and kept updated using GitHub Actions for automated builds, package signing, and upload facilitation. The client could distribute direct file links to potential customers.

The auto-update feature ensured every user had the most current version of the alpha build.

### The Beta Stage

In beta, I integrated OAuth to allow Project Varese users to sync data between platforms using their existing accounts. This facilitated a user-friendly login flow from the desktop application to Project Varese, offering seamless experiences across both platforms.

### Stable Release and Member-Exclusive Features

After Project Varese's launch, I fine-tuned Supersonic by making certain features exclusively accessible to users who purchased login access through the web application. Stripe managed the various membership plans.

## The Result

Supersonic emerged as a comprehensive desktop application with a visual editor, hundreds of models, and instantaneous calculation and diagram feedback. It successfully integrated with Project Varese, providing users with a unified, streamlined experience when designing solutions for architectural acoustics.

With OAuth login, users can effortlessly link their existing Varese accounts, enhancing their capabilities by incorporating existing data within the desktop app.
    `,
  },
  "project-varese": {
    slug: "project-varese",
    title: "SaaS Platform with Autodesk Integration",
    client: "10log LLC",
    description:
      "Architected and built a full SaaS platform for architectural acoustics consulting. Integrated Autodesk Model Derivative API and Viewer SDK for 3D model visualization. Built custom authentication with FusionAuth, payment processing with Stripe, and a project management system with Gantt charts.",
    technologies: ["React", "TypeScript", "Autodesk APIs", "FusionAuth", "Stripe", "PostgreSQL"],
    results: [
      "Launched in 2022",
      "3D model interaction with real-time collaboration",
      "Unified ecosystem across web and desktop apps",
    ],
    content: `
## The Challenge

In 2021, 10log LLC tasked me with constructing the next generation of digital acoustics platforms. They were building a suite of web-based technical and project management tools for the architectural acoustics and noise control consulting community.

### User-Centric Authentication

10log expressed a desire for a non-cloud-based authentication solution to store user data securely in a database under our control. The challenge was ensuring user data protection while maintaining accessibility.

### Building a Unified App Ecosystem

A key objective was to facilitate seamless connectivity between Project Varese and the Supersonic desktop app. I aimed to establish an ecosystem where users could access multiple platforms using a single account, unifying their data across different access points.

### Enabling Autodesk Support

Autodesk is ubiquitous in architectural acoustics and civil engineering. Enhancing its browser-based 3D model viewer to serve the unique needs of acoustical engineers using Project Varese was crucial.

## My Solutions

### Payments

Leveraging my experience with Stripe, I implemented a reliable payment processing system, enabling secure transactions without delay.

### Authentication via FusionAuth

To align with the client's requirements for data storage and cost-effectiveness, I opted for FusionAuth. This customer authentication platform was hosted on a separate Digital Ocean Droplet, managing user sign-ups, log-ins, two-factor authentication, and OAuth between different applications within the 10log ecosystem.

### Creating a Unified App Ecosystem

I introduced a custom OAuth solution to Project Varese to enhance data sharing between it and Supersonic. Users can now log into Supersonic with their accounts and interact with web-created data right from the desktop application.

### Integrated Autodesk Functionality

Using the Autodesk Model Derivative API and Viewer SDK, I incorporated architectural models into Project Varese. This integration allows acoustical engineers and consultants to interact with models in real-time, leaving suggestions for team members regarding material type and dimensions.

## Project Outcome

In 2022, I successfully launched Project Varese. This comprehensive solution revolutionizes the architectural acoustics and noise control industry with a blend of technical and project management tools, including a custom-built Gantt chart for project planning.

Project Varese empowers users to visualize the entire project lifecycle, facilitating data import from Autodesk projects using the Model Derivative API, and displaying 3D building models within the Viewer.
    `,
  },
};

export default portfolio;
