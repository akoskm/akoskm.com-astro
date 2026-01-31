---
title: "SaaS Platform with Autodesk Integration"
client: "10log LLC"
clientUrl: "https://10log.io/"
description: "Architected and built a full SaaS platform for architectural acoustics consulting. Integrated Autodesk Model Derivative API and Viewer SDK for 3D model visualization. Built custom authentication with FusionAuth, payment processing with Stripe, and a project management system with Gantt charts."
technologies:
  - React
  - TypeScript
  - Autodesk APIs
  - FusionAuth
  - Stripe
  - PostgreSQL
results:
  - Launched in 2022
  - 3D model interaction with real-time collaboration
  - Unified ecosystem across web and desktop apps
---

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
