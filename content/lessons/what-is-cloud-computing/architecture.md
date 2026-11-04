## Before and after the cloud

```
  TRADITIONAL (you own everything)            CLOUD (you rent what you need)

  ┌──────────── Your building ───────────┐    ┌──────── AWS data centres ────────┐
  │  Servers you bought                  │    │  Huge shared pool of hardware    │
  │  Storage you bought                  │    │  ┌────┐┌────┐┌────┐┌────┐┌────┐  │
  │  Network gear you bought             │    │  │ A  ││ B  ││you ││ C  ││you │  │
  │  Power, cooling, security, staff     │    │  └────┘└────┘└────┘└────┘└────┘  │
  └──────────────────────────────────────┘    │  (A, B, C = other customers,     │
             ^                                │   isolated from each other)      │
             │ your users                     └───────────────^──────────────────┘
                                                              │ API requests over HTTPS
                                                   ┌──────────┴──────────┐
                                                   │ You: Console / CLI  │
                                                   │ / SDK, pay per use  │
                                                   └─────────────────────┘
```

## The request flow (the same for every AWS service)

```
 ┌──────────┐  1. signed API request   ┌──────────────────┐  3. create/read/delete  ┌────────────┐
 │ AWS CLI  │ ───────────────────────> │  Service endpoint│ ──────────────────────> │  Resource  │
 │ (you)    │                          │  e.g. S3         │                         │ (a bucket) │
 │          │ <─────────────────────── │  2. check: who?  │ <────────────────────── │            │
 └──────────┘  5. response (or error)  │     allowed?     │  4. result              └────────────┘
                                       └──────────────────┘
                                               │
                                               v 6. usage metered → bill
```

## The components, and how they relate

| Component | Role | Relationship |
|---|---|---|
| **You (the customer)** | Decide what to create and when | Send requests; receive a bill |
| **Client tool** (Console, CLI, SDK) | Turns your intent into API requests | Signs requests with your credentials |
| **Endpoint** | The web address of one AWS service in one Region | Receives and checks requests |
| **Control plane** | AWS software that creates, changes and deletes resources | Draws on the shared pool |
| **Shared pool** | The physical hardware in AWS data centres | Shared by many customers, isolated per customer |
| **Metering and billing** | Records what each customer uses | Produces your monthly bill |

## In your lab

```
 ┌──────────┐   --endpoint-url http://localhost:4566   ┌─────────────────────────┐
 │ AWS CLI  │ ───────────────────────────────────────> │ Floci (Docker on your   │
 │ on Mac   │ <─────────────────────────────────────── │ Mac, emulates the APIs) │
 └──────────┘          responses shaped like AWS       └─────────────────────────┘
          No request reaches real AWS. No bill. Same commands you'd use in real AWS.
```
