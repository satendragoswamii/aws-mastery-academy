## The five essential characteristics

NIST says a service is only truly "cloud" if it has all five of these. Learn them well: they explain *how* the cloud behaves.

### 1. On-demand self-service
You get resources **yourself**, whenever you want, without asking a person.
*AWS example:* one command creates a storage bucket in under a second. You'll do this in the demonstration.

### 2. Broad network access
Resources are reached **over the network** using standard tools, such as a web browser, a command line or code.
*AWS example:* the same S3 bucket can be used from the AWS Console in your browser, the AWS CLI in your terminal, or a Python program.

### 3. Resource pooling
The provider has a huge **shared pool** of hardware. Many customers use it at the same time, but each customer's data and resources are kept separate. This is called **multi-tenancy**. You usually don't know, or need to know, which physical machine you're on.
*AWS example:* your virtual server might share a physical host with servers from other customers, isolated from each other by virtualization (covered in a later lesson).

### 4. Rapid elasticity
Capacity can **grow and shrink quickly**, sometimes automatically, so to you it seems unlimited.
*AWS example:* Auto Scaling adds servers when traffic rises and removes them when it falls.

### 5. Measured service
Usage is **measured** and you're billed for it, like an electricity meter.
*AWS example:* S3 bills per GB stored per month and per request. EC2 bills by the second for many instance types.

## What actually happens when you "create" something

When you ask AWS for a resource, there's no person involved. This happens:

1. Your tool (Console, CLI or SDK) sends an **API request** over HTTPS to an AWS **endpoint**, a web address such as `s3.us-east-1.amazonaws.com`.
2. AWS checks **who you are** (authentication) and **whether you're allowed** (authorization).
3. AWS's control software finds capacity in its pool and creates the resource.
4. AWS sends back a **response**: success with details, or an error explaining what went wrong.
5. The meter starts running, and you're billed for what the resource uses.

> **Remember this flow.** *Everything* in AWS works this way: a signed API request to an endpoint, then a response. The Console's buttons and the CLI's commands are friendly wrappers around these API calls. In Level 2 you'll look at these requests directly.

## Where Floci fits

Floci is an **emulator**. It runs on your Mac and answers the same API requests that AWS would, at `http://localhost:4566`. When you point the AWS CLI at Floci, step 1 goes to your laptop instead of to Amazon. Steps 3–5 are simulated. Nothing is billed, and nothing leaves your machine.
