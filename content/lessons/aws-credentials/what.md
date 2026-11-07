## What are AWS credentials?

### The simple version
Credentials are how AWS knows **who is asking**. Like keys to a building, there are different kinds:

~~~text
Kind                        Like...                               Used by
--------------------------  ------------------------------------  ------------------------------
Password (+ MFA)            your front-door key + a PIN           a person, in the console
Access key (AKIA...)        a key copied for a contractor         CLI, SDKs, tools
                            (works until you change the lock)
Temporary credentials       a hotel key card that stops           roles, SSO, AWS services
  (ASIA... + token)         working at checkout time
~~~

The safest kind is the **hotel key card**: even if someone steals it, it stops working soon.

### The professional version
| Credential | Belongs to | Lifetime | Where it's used |
|---|---|---|---|
| Root user email + password (+ MFA) | The account | Until changed | A handful of account tasks only |
| IAM user password (+ MFA) | IAM user | Until changed | Console sign-in |
| **Access key** (access key ID `AKIA…` + secret access key) | IAM user (or root, never do that) | **Until deactivated or deleted** | Signing API requests (CLI, SDKs) |
| **Temporary credentials** (`ASIA…` + secret + **session token**) | A role session or federated user | **15 minutes to 12 hours** | Everything AWS recommends: roles, IAM Identity Center, EC2/ECS/Lambda roles |
| SSH key pairs, X.509 certificates, CodeCommit credentials | Specific services | Varies | Not for AWS APIs; covered in later lessons |

**AWS STS** (Security Token Service) issues temporary credentials. Its main operations:

| Operation | Gives temporary credentials for |
|---|---|
| `AssumeRole` | A role, from another identity (same or another account) |
| `AssumeRoleWithWebIdentity` | A role, from an OIDC token (EKS pods, GitHub Actions) |
| `AssumeRoleWithSAML` | A role, from a corporate identity provider |
| `GetSessionToken` | The same IAM user, usually to add MFA |
| `GetCallerIdentity` | Nothing; just tells you who you are (needs no permissions) |

### What you'll do
Act as the administrator: create a developer user and its access key **without ever printing the secret**, inspect and **rotate** the key, read the **credential report**, get **temporary credentials** with AssumeRole, and set up a **role profile** that does it automatically.
