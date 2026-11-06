## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2, task 2.3** (root user, access management) and **Domain 4, task 4.2** (Organizations, consolidated billing).

| Question wording | Answer |
|---|---|
| "identity with complete access to all resources, created with the account" | **Root user** |
| "best practice for the root user" | Enable **MFA**, delete access keys, use only for root-only tasks |
| "centrally manage multiple AWS accounts" | **AWS Organizations** |
| "restrict what services/actions member accounts can use" | **Service control policies (SCPs)** |
| "one bill for multiple accounts, volume discounts" | **Consolidated billing** |
| "group accounts to apply common policies" | **Organizational units** |
| "set up a secure multi-account environment based on best practices" | **AWS Control Tower** (landing zone) |
| "single sign-on to multiple accounts" | **AWS IAM Identity Center** |

### Root-only tasks to recognise
Changing the account's root email/password, closing the account, restoring IAM user permissions when locked out, changing the AWS support plan, and certain billing settings.

### Exam traps
- **SCPs don't grant permissions**; they only limit. IAM still has to allow.
- **SCPs don't affect the management account.**
- **SCPs do affect member accounts' root users.**
- Consolidated billing is **free**.
- Root user ≠ "an IAM user with AdministratorAccess". Root can't be restricted by IAM policies.

### Associate and professional exams
Expect multi-account strategies, SCP design (Region restriction with global-service exceptions), cross-account access with roles, delegated administrators for security services, and Control Tower guardrails.
