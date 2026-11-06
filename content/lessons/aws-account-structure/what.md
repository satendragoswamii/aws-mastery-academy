## What is an AWS account, and how are accounts organised?

### The simple version
An **AWS account** is like a **separate flat** in a large building. Everything inside (furniture, keys, electricity meter) belongs to that flat. Neighbours can't walk in, and each flat gets its own bill.

- The **root user** is the flat's **master key**: it opens everything and can't be restricted. You keep it in a safe and use everyday keys instead.
- A company with many teams rents **many flats**: one for the live shop, one for testing, one for security logs…
- **AWS Organizations** is the **building management office**: it creates flats, groups them by floor (**organizational units**), sets building rules (**service control policies**) and sends **one combined bill**.

### The professional version
An AWS account is a **hard isolation boundary** for:
| Boundary | Meaning |
|---|---|
| **Security** | Identities and permissions are per account; by default nothing in account A can reach account B |
| **Billing** | Usage is metered and attributed per account |
| **Quotas** | Service quotas (e.g. number of instances) are per account and Region |
| **Blast radius** | A mistake or breach in one account is contained there |

Every account has a **12-digit ID** (appearing in every ARN) and a **root user** (the sign-up email address). Day-to-day access uses **IAM** roles and users or **IAM Identity Center**.

### AWS Organizations
~~~text
Organization (o-…)
 +-- Root (r-…)                               <- policies here apply to every account
      +-- Management account                  <- pays the bill, runs Organizations; SCPs don't apply to it
      +-- OU: Security
      |     +-- log-archive account
      |     +-- security-tooling account
      +-- OU: Workloads        [SCP: only ap-south-1/ap-south-2]
      |     +-- shop-prod account
      +-- OU: Sandbox          [SCP: no expensive instance types]
            +-- shop-dev account
~~~

| Feature | What it does |
|---|---|
| Create or invite accounts | Programmatic account creation (`create-account`) or invitations |
| Organizational units | Group accounts; nest up to five levels |
| **Service control policies (SCPs)** | Maximum permissions for everyone in member accounts |
| Tag, backup and AI opt-out policies | Other centrally managed policies |
| **Consolidated billing** | One bill, combined volume discounts, shared Savings Plans/RIs |
| Delegated administration | Let a member account run GuardDuty, Security Hub, etc. for all |

**AWS Control Tower** builds on Organizations to set up a best-practice **landing zone** (OUs, log archive, audit account, guardrails) automatically.

### What you'll build
On Floci: an organization with two OUs (`ama-l1-workloads`, `ama-l1-sandbox`), two member accounts (`ama-l1-shop-prod`, `ama-l1-shop-dev`), and an SCP that keeps production in India's two Regions. Then you'll take it all apart in the right order.
