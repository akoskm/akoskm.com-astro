/**
 * Meta descriptions for Hashnode posts whose seo.description is empty.
 * Those posts have no markdown frontmatter in this repo.
 */
export const POST_DESCRIPTIONS: Record<string, string> = {
  "apollo-client-react-typescript-example":
    "Set up Apollo Client in React and TypeScript and query the public SpaceX GraphQL API, including caching and errors, with no custom backend.",
  "blogging-in-your-first-language":
    "Why Ákos started blogging in English, and why writing in your first language still reaches readers an English-only blog misses.",
  "browserify-in-production":
    "How Realtime Raytracer uses Browserify npm scripts for a debuggable development build and a compressed bundle served in production.",
  "deploy-changes-with-git-push":
    "Ship an app with a git post-receive hook. Includes a 2021 note that most cloud hosts now provide this kind of deploy for you.",
  "dev-retro-2022-8020ing-2023":
    "Ákos's 2022 developer retrospective: what to spend more time on in 2023, what to drop, and a thank-you to readers.",
  "heroku-custom-domain-ssl-certificate":
    "Point a custom domain at a Heroku app and turn on HTTPS, from buying the domain through the Heroku CLI and certificate setup.",
  "how-i-made-my-first-dollars-from-blogging":
    "How a small blog of about 21 posts made its first money, including the one article that brought in most of the attention.",
  "how-to-package-electron-applications-with-electron-builder":
    "electron-builder 26.18.0 and Electron 45: one config for a Mac dmg, a Windows NSIS installer, and a Linux AppImage. Notarize with notarytool, then publish.",
  "how-to-test-props-in-react-testing-library":
    "Test props passed to a React function component with React Testing Library and Jest, including values that do not stringify well.",
  "how-to-test-props-in-react-with-jest":
    "Mock a child React component with Jest, render its props as text, and assert that the parent passed the props you expect.",
  "how-to-type-react-props-with-typescript":
    "Two ways to type React component props in TypeScript, and which one stays safe when noImplicitAny is on.",
  "i-want-to-build-my-blog-because-thats-one-of-the-best-ways-to-gain-credibility-in-my-niche":
    "Long-form posts build credibility in a niche. Twitter can find readers, but the trust should live on a blog you own.",
  "jquery-find-element-namespace":
    "Query namespaced XML with jQuery. find() on fancynamespace:tag works in Firefox or Chrome, not both, and a nodeName filter fixes it.",
  "lets-talk-about-bind":
    "The difference between JavaScript apply, call, and bind: apply takes an array of arguments, call and bind take them one by one, and bind does not invoke the function.",
  "mocha-to-jest-migration":
    "Move a Mocha suite to Jest with small edits instead of rewriting tests, including JSDOM via Jest's testEnvironment and mocha.opts.",
  "mongodb-schemas-lessons-learned":
    "Schema lessons from building 10log.com on MongoDB. Documents are schemaless in the relational sense, but the shape of the data still matters.",
  "node-js-unit-testing-stripe-api-tutorial":
    "Unit test a Node.js Stripe integration so a successful charge triggers the side effects your app expects. This tutorial was featured in Node Weekly.",
  "react-synthetic-event-warning":
    "Why React 16 warns that a synthetic event is reused for performance, and why that warning no longer applies in React 17.",
  "solve-problems-like-a-developer":
    "A problem-solving loop for developers, writers, and designers: state the problem clearly before trying to solve it.",
  "testing-implementation-details":
    "Why tests that lock onto implementation details slow a project down, and what to assert so refactors stay safe.",
  "the-right-way-to-create-utility-functions-in-typescript":
    "How to organize TypeScript utility functions so business rules stay consistent while a JavaScript codebase moves to TypeScript.",
  "twitter-sign-in-for-web-apps":
    "Add Twitter sign-in to a Java web app with scribe-java. Pin-based examples are not enough for the web flow. Updated for scribe 2.0.",
  "typescript-practical-example-prop-type":
    "After using React context to stop prop drilling, replace repeated PropTypes with TypeScript and the tradeoff that introduces.",
  "upgrading-from-jbpm-610final-to-620final":
    "Breaking API and persistence changes when upgrading jBPM from 6.1.0.Final to 6.2.0.Final, including JPATaskLifeCycleEventListener.",
  "use-nodejs-in-electron":
    "Electron can use browser APIs and Node.js in the same desktop app. That combination is what makes the platform useful.",
  "utilizing-sha3":
    "Notes from rewriting access-token generation: UUID pitfalls, collision risks in MD5 and SHA-1, and switching the hash to SHA-3.",
  "whats-new-in-react-19-action-hooks":
    "React 19 action hooks, each with what it does and a real use case, plus a short video of trying them out.",
  "writer-buddy":
    "On publishing cadence and Writer Buddy. The routine that works is the one you keep: Ákos writes daily between 6 and 8 PM.",
};
