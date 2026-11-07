## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
| Question wording | Answer |
|---|---|
| "give an EC2 application access to S3 securely" | **IAM role** (instance profile), not access keys |
| "manage permissions for a team of developers" | **IAM group** |
| "temporary credentials" | **IAM role** / AWS STS |
| "single sign-on to multiple accounts" | **IAM Identity Center** |
| "allow another AWS account to access resources" | **Cross-account IAM role** |

### Solutions Architect – Associate (SAA-C03)
- Trust policy versus permissions policy.
- Instance profiles; Lambda and ECS task execution roles.
- Cross-account roles, external ID and the confused deputy problem.
- Federation with SAML/OIDC and Identity Center.
- Service-linked roles exist and are managed by the service.

### Exam traps
- Groups **can't** be principals and **can't** be nested.
- A role has **no** long-term credentials.
- An instance profile holds **one** role.
- "Store access keys on the instance" is always the wrong answer when a role is possible.
- Trusting `arn:aws:iam::ACCOUNT:root` trusts the whole account (subject to that account's own policies), not just its root user.
