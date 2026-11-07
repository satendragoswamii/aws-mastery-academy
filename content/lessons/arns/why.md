## Why ARNs matter

### Names aren't unique, ARNs are
Lesson 25 showed two queues both called `ama-l2-reg-orders` living happily in two Regions. Thousands of AWS accounts also have a queue called `orders`. When a policy, an alarm or another account needs to point at **your** queue, only the ARN is precise enough.

### Permissions are written in ARNs
IAM policies say *who* may do *what* to *which resource*. "Which resource" is the `Resource` element, a list of ARNs. If you can't read and write ARNs correctly, you will write policies that either **don't work** (wrong ARN, AccessDenied) or **allow too much** (`"Resource": "*"` because the right ARN was too hard).

### Everything else refers to ARNs too
- **Cross-account access**: bucket policies, KMS key policies and role trust policies name other accounts' principals by ARN.
- **Wiring services together**: SNS subscriptions, Lambda triggers, EventBridge targets and Step Functions all take ARNs.
- **Auditing**: every CloudTrail event records the caller's ARN and the resource ARNs.
- **Tagging and inventory**: the Resource Groups Tagging API works only with ARNs, across all services.

~~~text
IAM policy  ----"Resource": ARN----+
SNS topic   ----subscribe ARN------+--> arn:aws:sqs:ap-south-1:123456789012:orders
CloudTrail  ----resources[].ARN----+
Tagging API ----ResourceARN--------+
~~~

## Why this matters for you
Every IAM lesson that follows uses ARNs. CLF-C02 expects you to recognise them; SAA-C03, SCS-C02 and the developer exams expect you to **write** correct ARN patterns, spot the bucket-versus-object mistake, and know when a field is empty.
