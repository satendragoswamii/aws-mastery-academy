## What are users, groups and roles?

### The simple version
Think of a hospital.
- A **user** is a staff member with their own permanent ID card.
- A **group** is a department (nurses, pharmacy). Doors are opened for the department, and everyone in it gets them.
- A **role** is a visitor badge for a job, such as "night pharmacist". Someone trusted picks it up, uses it for a shift, and hands it back. The badge stops working after a few hours.

~~~text
USERS (people)          GROUPS (teams)             ROLES (borrowed, temporary)
arjun  --------------> developers  -> S3 read      web servers  (trust: EC2)
   \                                               partner      (trust: account 1111...)
    +----------------> oncall      -> CW read      auto scaling (service-linked)
sneha  --------------> developers  -> S3 read
~~~

### The professional version
| | IAM user | IAM group | IAM role |
|---|---|---|---|
| Is it a principal (can it act)? | Yes | **No** | Yes, once assumed |
| Credentials | Long-term password and/or access keys | None | Temporary, from STS |
| Who uses it | One person or legacy app | A set of users | Services, apps, other accounts, federated people |
| Gets permissions from | Own policies + groups | Attached policies | Permissions policies |
| Extra policy | (none) | (none) | **Trust policy**: who may assume it |
| Limits | 5,000 per account | 300 per account; user in up to 10 | 1,000 per account (raisable) |

### Kinds of roles
| Kind | Trusted principal | Example |
|---|---|---|
| Service role | An AWS service | `ec2.amazonaws.com`, `lambda.amazonaws.com` |
| Cross-account role | Another account (optionally with external ID) | Partner audit, central security account |
| Role for federation | An identity provider (SAML/OIDC) | IAM Identity Center, GitHub Actions |
| Service-linked role | A service, defined and managed by AWS | `AWSServiceRoleForAutoScaling` |
