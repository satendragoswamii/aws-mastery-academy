## How users, groups and roles work

### How a user's permissions are calculated
~~~text
user's own policies  +  group A policies  +  group B policies  =  identity permissions
(managed + inline)                                               (then the usual rules:
                                                                  explicit Deny wins,
                                                                  default is deny)
~~~
Groups can't contain groups, and a Deny in any group applies to the user.

### How a role is assumed
~~~text
1. caller --sts:AssumeRole(role ARN, session name, [external ID], [MFA])--> STS
2. STS checks the role's TRUST policy:   is this caller allowed?            (Floci skips this)
3. STS checks the caller's own policy:   may it call sts:AssumeRole on it?  (needed for same-account users)
4. STS returns temporary credentials (15 min to the role's max, default 1 h)
5. caller uses them; requests are authorised by the role's PERMISSIONS policies
~~~
Two policies, two questions:

| Policy | Question it answers | Example principal/action |
|---|---|---|
| Trust policy | **Who** may become this role? | `"Principal":{"Service":"ec2.amazonaws.com"}`, `sts:AssumeRole` |
| Permissions policy | **What** may the role do? | `s3:GetObject` on a bucket |

### EC2 and instance profiles
EC2 attaches an **instance profile** (one role) to an instance. The instance metadata service at `169.254.169.254` hands out the role's credentials, refreshed before they expire. With IMDSv2, code must first get a session token, which blocks many server-side request forgery attacks. Lambda, ECS and other services use an **execution role** set directly on the function or task.

### Cross-account trust
A trust policy naming `arn:aws:iam::111122223333:root` trusts **the account**, not literally its root user: any principal there whose own policies allow `sts:AssumeRole` on your role may use it. Both sides must agree. Add `sts:ExternalId` for third parties, and `aws:PrincipalOrgID` or specific role ARNs to narrow it further.

### Service-linked roles
Created with `iam create-service-linked-role` (endpoint in this academy) or automatically by the service. Their trust and permissions are fixed by AWS; deletion goes through `delete-service-linked-role`, which first checks the service no longer needs it and returns a deletion task.

### Paths and tags
Paths (`/eng/`, `/ci/`) group identities for listing and ARN patterns. Tags (`team=payments`) describe them and can drive policy conditions such as `aws:PrincipalTag/team`.
