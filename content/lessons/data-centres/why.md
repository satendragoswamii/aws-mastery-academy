## Why do data centres exist?

### Servers don't like offices
Put twenty servers in an office cupboard and you'll quickly find out why data centres exist:
- The cupboard gets **hot**, and hardware starts failing.
- A **power cut** takes everything down.
- The office's single internet line becomes the **bottleneck** and a single point of failure.
- Anyone who walks past can **unplug** or **steal** a server.

A data centre solves these problems once, at scale, for thousands of servers.

### Scale makes it cheaper and better
A huge facility can afford things a server room can't:
- Its own electrical substations, and power bought in bulk.
- Highly efficient cooling (a better **PUE**).
- Round-the-clock security staff and engineers.
- Direct fibre connections to many network providers.

Spread across tens of thousands of servers, each server gets better protection for less money. This is a big part of the **economies of scale** advantage of the cloud.

## Why AWS groups them into Availability Zones
Even the best data centre can fail: a fire, a flood, a fault in a power substation, a construction crew cutting fibre. AWS assumes that **any single data centre will fail eventually**. So it:

1. Groups data centres into **AZs** that don't share power, cooling or network paths with other AZs.
2. Places several AZs in each **Region**, far enough apart that one local disaster is unlikely to affect two, but close enough for fast links between them.
3. Lets you spread your application across AZs, so losing one doesn't take you down.

> Werner Vogels, Amazon's CTO, put it simply: **"Everything fails, all the time."** AWS's data-centre design is built on that assumption, and so should yours be.

## Why this matters for you
- **Availability**: running in two or more AZs is the most common exam answer to "how do we make this highly available?"
- **Security**: physical data-centre security is entirely **AWS's** responsibility, and the exam tests that you know it.
- **Compliance**: choosing a Region decides which country your data physically sits in.
- **Cost and sustainability**: large, efficient data centres are part of why cloud can cost less and use less energy than many small server rooms.
