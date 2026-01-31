---
title: "Cross-Platform Desktop App for Acoustical Engineering"
client: "10log LLC"
clientUrl: "https://10log.io/"
description: "Transformed a proof-of-concept into a production Electron app for acoustical engineers. Built OAuth integration with the client's SaaS platform, implemented auto-updates via GitHub Actions, and managed staged rollout from alpha to stable release with Stripe-gated features."
technologies:
  - Electron
  - TypeScript
  - OAuth
  - FusionAuth
  - Stripe
  - GitHub Actions
results:
  - Shipped on Mac and Windows
  - Seamless data sync with web platform
  - Auto-update system for continuous delivery
---

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
