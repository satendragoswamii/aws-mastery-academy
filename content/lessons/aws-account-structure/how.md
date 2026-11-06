## How accounts and Organizations work

### Account identity in every ARN
~~~text
arn:aws:s3:::ama-l1-shop-records                     (S3 bucket names are global, no account)
arn:aws:iam::452733742654:role/shop-app              (IAM is global, so no Region, but the account is there)
arn:aws:dynamodb:ap-south-1:452733742654:table/orders
                 ^ Region   ^ account ID
~~~

### How SCPs combine with IAM
An action is allowed only if **every layer** allows it:

~~~text
                         +-------------------------------+
SCP on root/OUs   ------>| maximum allowed (guardrail)   |   grants nothing on its own
                         +-------------------------------+
                                   ∩  (intersection)
                         +-------------------------------+
IAM policy        ------>| what the user/role is granted |
                         +-------------------------------+
                                   =
                         effective permissions (any explicit Deny anywhere wins)
~~~

- `FullAWSAccess` is attached everywhere by default, so nothing is restricted until you add a deny SCP (or replace it with an allow-list).
- SCPs apply to all users and roles **in member accounts, including their root users**.
- SCPs **never** apply to the management account, which is one reason to keep workloads out of it.

### The Region-restriction SCP, explained
~~~text
"Effect": "Deny",
"NotAction": ["iam:*", "organizations:*", "sts:*", ...global services...],   <- everything EXCEPT global services
"Resource": "*",
"Condition": {"StringNotEquals": {"aws:RequestedRegion": ["ap-south-1", "ap-south-2"]}}
                                 ^ if the request targets any other Region -> denied
~~~

### Consolidated billing in numbers
Volume tiers apply to **combined** usage. If S3's first price tier ends at 50 TB:

| | prod | dev | Billed separately | Billed together |
|---|---|---|---|---|
| S3 storage | 40 TB | 20 TB | each in tier 1 | 50 TB in tier 1 + 10 TB in the cheaper tier 2 |

### Order matters when dismantling
~~~text
detach SCPs -> delete SCPs -> move accounts out of OUs -> delete OUs -> remove (or close) member accounts -> delete organization
~~~
Real AWS adds conditions: a member account can leave only if it can stand alone (its own payment method and contact details), and accounts created by Organizations are usually **closed** instead (`close-account`). Closed accounts stay suspended for 90 days before final deletion.
