## The simple version

**A highly available system keeps working when one of its parts breaks.**

Think of a hospital:
- It has **two power supplies** (the grid and a generator).
- It has **several doctors** on duty, so one falling ill doesn't close the emergency room.
- A nurse **checks on patients regularly**, so problems are noticed quickly.

Nothing about that hospital is unbreakable. Things fail all the time. But because there are **spares** and someone **checks**, patients are still treated.

Computer systems work the same way:
- **Spares**: more than one server, in more than one data-centre group (Availability Zone).
- **Checks**: a load balancer asks each server "are you OK?" every few seconds.
- **Switching**: users are sent only to servers that answer "yes".

## The professional version

**High availability (HA)** is a system's ability to remain operational for a high percentage of time. It's achieved by:

1. **Eliminating single points of failure (SPOFs)** with redundancy at every layer.
2. **Detecting failures** quickly, with health checks and monitoring.
3. **Recovering automatically**: routing around failures, failing over, and replacing broken components.

Availability is measured as a percentage of uptime, the **"nines"**:

| Availability | Downtime per year | Downtime per 30-day month |
|---|---|---|
| 99% ("two nines") | ~3.65 days | ~7.2 hours |
| 99.9% ("three nines") | ~8.8 hours | ~43 minutes |
| 99.95% | ~4.4 hours | ~22 minutes |
| 99.99% ("four nines") | ~53 minutes | ~4.3 minutes |
| 99.999% ("five nines") | ~5.3 minutes | ~26 seconds |

> **Key idea:** HA isn't about components that never fail. It's about a **design** that keeps serving **while** components fail.

In AWS, the standard HA building blocks are **multiple Availability Zones**, **Elastic Load Balancing** with health checks, **Auto Scaling** (to replace failed instances) and **managed services with built-in redundancy** (S3, DynamoDB, RDS Multi-AZ).
