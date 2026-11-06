## Why cloud security matters

### Most cloud breaches are configuration mistakes
The big cloud data leaks rarely come from someone "hacking AWS". They come from customer configuration:
- a storage bucket made public "for a quick test",
- access keys committed to a public Git repository,
- a user or application with far more permissions than it needed,
- a database reachable from the internet with a weak password.

Each of these has a simple control, and you'll practise most of them in this lesson.

### The cloud is reachable from anywhere
On-premises, an attacker usually has to get into your building or your network first. In the cloud, **the control plane (the AWS APIs) is on the internet**. Anyone holding valid credentials can call it from anywhere. That makes identity (who you are, and what you're allowed to do) the new perimeter.

### Mistakes spread fast, and so do fixes
One API call can expose a bucket with millions of records. The good news: one API call can also lock down every bucket in an account (account-level Block Public Access), and one policy can stop everyone in an organisation from disabling logging (Service Control Policies). Security in the cloud is **code and configuration**, which means it can be reviewed, automated and applied everywhere at once.

### Laws and customers require it
Regulations such as India's **Digital Personal Data Protection Act 2023**, the EU's GDPR, and card-industry rules (PCI DSS) require you to protect personal and payment data, often explicitly with encryption and access control. Customers and auditors ask for evidence: who accessed what, when, and was it encrypted?

### Security makes everything else possible
A shop that can prove its data is encrypted, its access is minimal and its activity is logged can pass audits, win business customers and recover from incidents. Security isn't a feature you add at the end; it's the foundation the other pillars stand on.

## Why this matters for you
Domain 2 (Security and Compliance) is about **30%** of the CLF-C02 exam, the second-largest domain. Every associate and professional exam tests IAM, encryption and KMS. And in a job, the first thing a reviewer checks in your design is "what's public, and who can do what?"
