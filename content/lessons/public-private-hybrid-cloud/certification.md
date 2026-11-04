## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.1:** identify the **deployment models**: cloud (all-in), hybrid, on-premises (private cloud).
- **Domain 1, task 1.3 (migration):** hybrid as a stage of migration; the AWS Cloud Adoption Framework; migration strategies (covered later in the course).
- **Domain 3 (technology):** recognise **Site-to-Site VPN**, **Direct Connect**, **Outposts**, **Storage Gateway** and **DataSync** as hybrid services.

### What the exam expects
| Scenario wording | Answer |
|---|---|
| "All workloads run in AWS" | Cloud (all-in / cloud-native) deployment |
| "Connect on-premises infrastructure to the AWS Cloud" | Hybrid deployment |
| "Resources in the company's own data centre, using virtualisation" | On-premises / private cloud |
| "Dedicated, private, consistent network connection to AWS" | AWS Direct Connect |
| "Encrypted connection over the internet, quick to set up" | AWS Site-to-Site VPN |
| "Run AWS services in our own data centre" | AWS Outposts |
| "On-prem applications use cloud storage through local file shares" | AWS Storage Gateway |
| "Move large amounts of data online, on-prem to AWS" | AWS DataSync |

### Exam traps
- **Hybrid ≠ multi-cloud.** Two public clouds is multi-cloud.
- **Direct Connect isn't encrypted by default.** If the question insists on encryption, look for VPN or MACsec.
- **Direct Connect takes weeks** to provision; VPN takes hours. "As quickly as possible" points to VPN.
- **"Private cloud" in AWS wording usually means on-premises.** It isn't the same as a VPC (a VPC is a private network **inside** the public cloud).

### Solutions Architect – Associate (SAA-C03)
Expect designs with Direct Connect plus a VPN backup, Transit Gateway for many connections, Storage Gateway types (File, Volume, Tape) and DataSync versus Snow Family choices.
