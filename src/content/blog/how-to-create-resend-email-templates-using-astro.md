---
title: "How to Create Resend Email Templates Using Astro"
publishedAt: "2024-10-11T05:16:39.073Z"
description: "Learn to create and send email templates in Astro using the Resend API with this comprehensive guide"
brief: "Hi friends! The following article is a guest post from Genesis (Nifty) on creating and sending Resend email templates using Astro. Hope you’ll like it!\n\nHello Friends of Ákos,\nIt’s an honor to get an opportunity to share my knowledge with all of you...."
readTimeInMinutes: 5
coverImage: "../../assets/posts/how-to-create-resend-email-templates-using-astro/cover.png"
tags:
  - name: "Astro"
    slug: "astro"
  - name: "resend"
    slug: "resend"
  - name: "Web Development"
    slug: "web-development"
  - name: "email"
    slug: "email"
  - name: "JavaScript"
    slug: "javascript"
  - name: "APIs"
    slug: "apis"
series: null
draft: false
---

Hi friends! The following article is a guest post from Genesis (Nifty) on creating and sending Resend email templates using Astro. Hope you’ll like it!

---

Hello Friends of Ákos,

It’s an honor to get an opportunity to share my knowledge with all of you. Since I’m a guest, I decided to cover something in Astro. You know, a framework most of us are familiar with. If you're struggling with creating email templates in your Astro projects, this article is for you.

If you’re unfamiliar with Resend, it’s an email API for developers. You can use it with a bunch of programming languages and frameworks. Some include Node.js, Python, PHP, and a lot more. Y’all didn’t really think I was gonna list them all here, did you? Nah, instead, here’s a link to the [Resend Docs](https://resend.com/docs/introduction). Skim them, read them, and refer to them.

Anyways, so how do we actually do this?

## Astro Project Setup {#heading-astro-project-setup}

We can start by creating the Astro project:

```bash
npm create astro@latest email-templates-astro
```

It will prompt you to choose how you would like to start your new project, with TypeScript or without. Choose how strict you want TypeScript, and install dependencies. Also, you can initialize a new git repository. This is how I chose to set up my Astro project:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfuwcFw2dSKK0T6a8iKV6gn4jhnAOPAFhp49FCoT-BON0ub2lPrNhHIlie8m06bQDUY-9meHfV9T4tJU0olNRq-1LjELwMKj3IXd9aJL5cK3OE4_chKS2A3hf85FjmCrAWjJQF08mIrAdnvILzM9X-qcmKK?key=0H5M5DUsIa5I-IW6qMwsFg)

Start the dev server with `npm run dev`, go to [http://localhost:4321/](http://localhost:4321/), and you will see your project. Try making changes to your `src/pages/index.astro` file and see them reflect.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdPjHYWdqEGEKucH7oxaRzT-uVkUgPNv80W37S3-X3q4kbLxj6wdkq1ln1Wp6jjP1e7s0AoPD4YuTVLItRkOsqprtMpoxN28Ej6a85lThd5FMOAS1zq9162V3CXIyEtMqxWcfIx6Ud0EFo57A0cLNkPaLT6?key=0H5M5DUsIa5I-IW6qMwsFg)

## Resend API Setup {#heading-resend-api-setup}

To create a Resend API Key, make a Resend account and go to API Keys in the sidebar. Press the “Create API Key” button. A modal should appear, prompting you to name the API key, choose permissions (full access or just sending access), and a domain (the default is all domains).

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcgQvq-BjVwlfpjUK2C9BZnYZr2Tb3pK143ngI539mcpuMg4A1jysNoU_7Ys4mpSR5K_r95I2efkMSMGL9RuJTQVbcQE7o4h4HzWkkl7sHTebb-o09dCD7hPP6MavckbVlJRPT21xurryqMHwDkJU_KYajj?key=0H5M5DUsIa5I-IW6qMwsFg)

As soon as you have a Resend API Key, create an `.env` file in your project and add the API Key:

```bash
RESEND_API_KEY="Your_Resend_API_Key"
```

Connect your website’s domain. In order to send emails to others from your chosen email address, you would need to connect your website’s domain:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcAvpMUP3w64w1a87iw4ca_cLqjG-4ahZ8UB-CyxNQfq0ZQRAzZzb-T8xgYlMMbZi6_9xx2W1N4Dmpo2nKzKXXjftwr1DWgG-rjHY_BrP1GwrpxMGQSKkt8e_U7_uvBYISyYBrYAV403my2vbwMmGeCczU?key=0H5M5DUsIa5I-IW6qMwsFg)

Once you have the Resend Node.Js SDK…

```bash
npm install resend
```

## Creating The Form {#heading-creating-the-form}

…we need a form, obviously. In this case, let’s have three fields: email, first name, and the message. We should also include a send button. Here you go:

```bash
<form method="POST" action="/api/send-email.json" enctype="application/x-www-form-urlencoded">
  <input type="email" name="email" id="email" placeholder="Enter Email..." required>
  <input type="text" name="firstName" id="firstName" placeholder="Enter Your Name..." required>
  <textarea name="message" id="message" placeholder="Enter Your Message Here..." required />
  <button type="submit">Send</button>
</form>
```

## Creating The Email Templates {#heading-creating-the-email-templates}

Also, we want to send two emails. One to the user for confirmation, and one to you because you’re who the message is for. So, create two components in your project. Here’s the basic version of both; however, I urge you to customize this code to better serve you:

`AdminEmailTemplate.astro`:

```xml
---
interface Props {
  firstName: string;
  message: string;
}

const { firstName, message } = Astro.props;

---

<div>
  <h1>New Message From { firstName }</h1>
  <p>They sent... <span>{message}</span></p>
</div>
```

`UserEmailTemplate.astro`:

```xml
---
interface Props {
  firstName: string;
  message: string;
}

const { firstName, message } = Astro.props;

---

<div>
  <h1>Welcome, { firstName }</h1>
  <p>You sent... <span>{message}</span></p>
</div>
```

## Creating The API Endpoint (Sending The Emails) {#heading-creating-the-api-endpoint-sending-the-emails}

You will need to create an `api` directory in your pages folder. Inside, create a `send-email.json.ts` file.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXf_GV67IuVNryRoyNNp5O7FMHx521F_qQKPWkzUHksJQ1SDwZujXgngdwcW2Qe7RRCjqMRgpBcZI_zWgQk9QeIZDj_3-1ToYcqZAzRbGX4Uc5RjF0EpreTPeG0xnevVc_1Bck2koz-WXOMNZSShJE6B2Es?key=0H5M5DUsIa5I-IW6qMwsFg)

Inside this file, we will get the formData and render the templates with Astro’s Container API. It allows you to take an Astro component, render it, and return a string or a response. In this case, we want a string representing the content rendered by the Astro component.

```javascript
export const prerender = false; //This will not work without this line and has to be here for server-side rendering

//Imports
import type { APIRoute } from "astro";
import { experimental_AstroContainer } from 'astro/container';
import { Resend } from "resend";
import UserEmailTemplate from "../../components/UserEmailTemplate.astro";
import AdminEmailTemplate from "../../components/AdminEmailTemplate.astro";

//Get Resend API key from environment variables
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const container = await experimental_AstroContainer.create(); //Creating Container

  //Fetching formData
  const data = await request.formData();
  const name = data.get("firstName") as string;
  const email = data.get("email") as string;
  const message = data.get("message") as string;

  //Checking all fields
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({
        message: `Fill out all fields.`,
      }),
      {
        status: 404,
        statusText: "Did not provide the right data",
      },
    );
  }

  //Rendering the templates
  const emailAdminHtml = await container.renderToString(AdminEmailTemplate, {
    props: { firstName: name, message },
  });

  const emailUserHtml = await container.renderToString(UserEmailTemplate, {
    props: { firstName: name, message },
  });
```

Send two emails using Resend. Make sure the email address domain you're sending from for the user’s email is the same domain you verified to be yours in Resend.

We’ll use resend.emails.send() and add the email data as the parameters ([from, to, subject, html, etc](https://resend.com/docs/api-reference/emails/send-email)). And then we will check if we were successful at sending the email or not.

```javascript
  //Sending the emails
  const sendUserResend = await resend.emails.send({
    from: "Your Name <your-email make sure your email has your domain>",
    to: `${email}`,
    subject: `Hi ${name}`,
    html: emailUserHtml,
  })

  const sendAdminEmail = await resend.emails.send({
    from: "support@resend.dev",
    to: `<your-email>`,
    subject: `Submission from ${name}`,
    html: emailAdminHtml,
  });

  //Checking for success or failure
  if (sendUserResend.data && sendAdminEmail) {
    return new Response(
      JSON.stringify({
        message: `Messages successfully sent!`,
      }),
      {
        status: 200,
        statusText: "OK",
      },
    )
  } else {
    return new Response(
      JSON.stringify({
        message: `Messages failed to send: User- ${JSON.stringify(sendUserResend.error)} Admin-${JSON.stringify(sendAdminEmail.error)} `,
      }),
      {
        status: 500,
        statusText: `Internal Server Error: User- ${JSON.stringify(sendUserResend.error)} Admin-${JSON.stringify(sendAdminEmail.error)} `,
      },
    );
  }
};
```

## Results {#heading-results}

And that’s all. It should work like a charm.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdCzlKG9nY9QYPmmVTpKjzL-mEVVryjO3cQaB_BlzXTfKwuWmCpy1ZTJgpVvbkR_mSIUKC7Ux9Fgq0ioVV_hWBts6hAe3SNYkHzoFUOXgAGDBU5G_aQ3bDS_VEkUG5VYjRMinHEfVy-rubx_j3Nrh3JNkzD?key=0H5M5DUsIa5I-IW6qMwsFg)

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdfRx5v4_jyFGu8BAulSwl-y2RWXKffaifOp5mBlQ2Eic_aH3O_oE4E7Aq7GyYTTcoz-s1OhB2-5bxqgz8tVbyaw2RUq2OStUBzVVnJU3yYbrTLIZ2wVomSj_XGHhCxTFzH9gzxzx-pUOftb05g21I8k6Y?key=0H5M5DUsIa5I-IW6qMwsFg)

Here, I put together a basic example for you folks on [GitHub](https://github.com/gencol3/astros-email-templates-example/tree/main):

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcrCn4M1SH9hKaOtGC6EFQtQGIUmpWIj_s_sdvuIRcp6GuIhy3pMnDB8EPmj68adVRUIJ0F_sZt6ZqSQmubSZIHJSo--LkImAGTPo69EPeP_XivR5RI2s9A_fdOpRhC-ztlNTcfdJ-mieVd4kTFTAAcdWsn?key=0H5M5DUsIa5I-IW6qMwsFg)

Happy Coding!

Nifty from Nifty Little Me Blog - [niftylittleme.com](https://www.niftylittleme.com)
