## Why the shared responsibility model matters

### "It's in the cloud, so AWS secures it" is wrong
The most dangerous beginner assumption is that moving to AWS makes you secure automatically. AWS runs some of the most secure data centres in the world, and that doesn't help at all if your bucket is public, your password is `admin123`, or your server hasn't been patched in two years. Industry analysts have long predicted that the great majority of cloud security failures are the **customer's** fault, through misconfiguration.

### You get a lot for free
The good news: you don't have to build or audit data-centre security, hardware lifecycle, network backbone protection or hypervisor isolation. That's an enormous amount of work (and cost) taken off your plate, and AWS proves it through independent audits you can download.

### It tells you exactly what to work on
The model is a to-do list. For each service you use, the customer column lists what you must configure: IAM, encryption, network exposure, patching (for IaaS) and data management. Choosing more managed services (RDS instead of a database on EC2, Lambda instead of servers) **shrinks your list**.

### Compliance depends on it
Auditors (for PCI DSS, ISO 27001, SOC 2, or India's DPDP Act) ask how every control is met. For AWS's layer you show AWS's reports from **AWS Artifact**. For your layer you show your own evidence. Without understanding the split, you can't answer the auditor.

## Why this matters for you
CLF-C02 task 2.1 is entirely this model, and questions are often phrased "which is the customer's responsibility?". The table in "What" (especially how EC2, RDS and Lambda differ) answers most of them.
