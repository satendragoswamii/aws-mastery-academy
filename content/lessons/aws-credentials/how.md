## How credentials work

### An access key, signed into every request
~~~text
access key ID      AKIAIOSFODNN7EXAMPLE          sent with the request (like a username)
secret access key  40 characters                 NEVER sent; used to compute the SigV4 signature
                                                 shown once at creation, never again
~~~
AWS looks up the secret for that key ID, recomputes the signature and compares. That is why a wrong secret gives `SignatureDoesNotMatch` and an unknown or deactivated key ID gives `InvalidClientTokenId`.

### Access key life cycle
~~~text
create (Active)  ->  used by apps  ->  create 2nd key  ->  switch apps  ->  old key Inactive  ->  delete
                                       (max 2 per user)                    (can be reactivated)   (permanent)
~~~

### AssumeRole step by step
~~~text
1. Caller (ama-dev keys) -> STS AssumeRole(RoleArn, RoleSessionName=asha, DurationSeconds=900)
2. STS checks:  the role's TRUST POLICY allows this caller (Principal), and
                the caller's own permissions allow sts:AssumeRole on the role (enforced on real AWS)
3. STS returns: AccessKeyId ASIA..., SecretAccessKey, SessionToken, Expiration
4. Caller uses all three -> acts as arn:aws:sts::ACCOUNT:assumed-role/ROLE/asha
   with the ROLE's permissions (not the caller's), until Expiration
~~~
Duration: minimum **900 seconds** (15 minutes); maximum is the role's **MaxSessionDuration** (default 1 hour, up to 12 hours). Role chaining (a role assuming another role) is limited to 1 hour.

### Where temporary credentials appear
| You do this | Behind the scenes |
|---|---|
| `aws sso login` + SSO profile | IAM Identity Center issues role credentials |
| Role profile (`role_arn` + `source_profile`) | CLI/SDK calls AssumeRole and caches the result |
| Run code on EC2 with an instance profile | Instance metadata hands out role credentials, refreshed automatically |
| ECS task role, Lambda execution role | The service injects role credentials |
| GitHub Actions with OIDC | `AssumeRoleWithWebIdentity` |

### The credential report
`generate-credential-report` builds a CSV of every IAM user and the root account: password enabled and last used, MFA active, and for each of the two access keys whether it is active, when it was last rotated and last used. AWS regenerates it at most every 4 hours.

### Environment variables for temporary credentials
~~~text
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...          <- required for ASIA keys; forgetting it is the classic mistake
~~~
